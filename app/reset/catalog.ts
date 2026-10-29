/**
 * Reset fee table. Shockwave sends one locked order. Recompute the charge
 * here and refuse the handoff when the cents differ. Do not discount again.
 * A percent-off charge is Math.round(fullCents * (100 - discountPercent) / 100).
 * Stripe never receives this table.
 */

import { isAllowedResetRedirect } from './urls';

export type ResetCategory = 'challenge' | 'funded' | 'vip';
export type ResetAccountType = 'standard' | '1-step' | 'instant' | 'gauntlet' | 'vip';

const CHALLENGE_LIST_CENTS = {
  standard: {
    5000: Math.round(88.5 * 100),
    10000: Math.round(163.5 * 100),
    25000: Math.round(283.5 * 100),
    50000: Math.round(433.5 * 100),
    100000: Math.round(748.5 * 100),
    200000: Math.round(1423.5 * 100),
    500000: Math.round(2848.5 * 100),
  },
  '1-step': {
    5000: Math.round(97.5 * 100),
    10000: Math.round(178.5 * 100),
    25000: Math.round(298.5 * 100),
    50000: Math.round(433.5 * 100),
    100000: Math.round(853.5 * 100),
    200000: Math.round(1483.5 * 100),
    500000: Math.round(2998.5 * 100),
  },
  instant: {
    5000: Math.round(448.5 * 100),
    10000: Math.round(823.5 * 100),
    25000: Math.round(1123.5 * 100),
    50000: Math.round(1348.5 * 100),
    100000: Math.round(2698.5 * 100),
    200000: Math.round(5248.5 * 100),
    500000: Math.round(10498.5 * 100),
  },
  gauntlet: {
    10000: Math.round(19.99 * 100),
    25000: Math.round(19.99 * 100),
    50000: Math.round(19.99 * 100),
    100000: Math.round(19.99 * 100),
    200000: Math.round(19.99 * 100),
    500000: Math.round(19.99 * 100),
  },
} as const;

const FUNDED_LIST_CENTS: Record<number, number> = {
  10000: Math.round(199 * 100),
  25000: Math.round(299 * 100),
  50000: Math.round(499 * 100),
  100000: Math.round(799 * 100),
  200000: Math.round(1499 * 100),
  500000: Math.round(2999 * 100),
};

const VIP_3M_LIST_CENTS = Math.round(14999 * 100);

const VIP_LIST = [
  { accountSize: 1000000, challengeAmount: '$1M', tierName: 'Professional', listCents: Math.round(5499 * 100) },
  { accountSize: 1500000, challengeAmount: '$1.5M', tierName: 'VIP', listCents: Math.round(VIP_3M_LIST_CENTS / 2) },
  { accountSize: 2000000, challengeAmount: '$2M', tierName: 'Executive', listCents: Math.round(9999 * 100) },
  { accountSize: 3000000, challengeAmount: '$3M', tierName: 'Institutional', listCents: VIP_3M_LIST_CENTS },
] as const;

const CATALOG_LABEL = {
  standard: 'Standard',
  '1-step': '1-Step',
  instant: 'Instant',
  gauntlet: 'Gauntlet',
} as const;

const CHALLENGE_ACCOUNT_TYPES = ['standard', '1-step', 'instant', 'gauntlet'] as const;
type ChallengeAccountType = (typeof CHALLENGE_ACCOUNT_TYPES)[number];

const KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_ID_PATTERN = /^[A-Za-z0-9]{10,128}$/;
const USER_PATTERN = /^[A-Za-z0-9]{6,128}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type PricedReset = {
  resetCategory: ResetCategory;
  accountType: ResetAccountType;
  accountSize: number;
  catalogType: string;
  challengeType: string;
  challengeAmount: string;
  resetType: string;
  tierName: string | null;
  platform: 'MT4' | 'MT5';
  discountPercent: number;
  originalCents: number;
  amountCents: number;
};

export type ResetOrder = PricedReset & {
  idempotencyKey: string;
  localOrderId: string;
  userId: string;
  accountId: string;
  accountStep: number | null;
  accountStatus: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  discordUsername: string;
  returnUrl: string;
  cancelUrl: string;
};

export function isResetReference(value: string): boolean {
  return KEY_PATTERN.test(value);
}

function isChallengeAccount(value: string): value is ChallengeAccountType {
  return (CHALLENGE_ACCOUNT_TYPES as readonly string[]).includes(value);
}

function formatSize(size: number): string {
  return `$${size.toLocaleString('en-US')}`;
}

function resetTypeLabel(category: ResetCategory, catalogType: string, tierName: string | null): string {
  if (category === 'funded') return 'Funded reset';
  if (category === 'vip') return tierName ? `${tierName} reset` : 'VIP reset';
  return `${catalogType} reset`;
}

export function chargeCents(listCents: number, discountPercent: number): number {
  return Math.round((listCents * (100 - discountPercent)) / 100);
}

export function priceResetSelection(input: {
  resetCategory: string;
  accountType: string;
  accountSize: number;
  catalogType: string;
  tierName: string | null;
  platform: string;
}): { ok: true; priced: PricedReset } | { ok: false; error: string } {
  const resetCategory = input.resetCategory.trim().toLowerCase();
  const accountType = input.accountType.trim().toLowerCase();
  const catalogType = input.catalogType.trim();
  const platformRaw = input.platform.trim().toUpperCase();
  if (platformRaw !== 'MT4' && platformRaw !== 'MT5') {
    return { ok: false, error: 'Platform selection is required' };
  }
  if (!Number.isInteger(input.accountSize) || input.accountSize <= 0) {
    return { ok: false, error: 'Choose a valid account size' };
  }

  let listCents: number | undefined;
  let challengeType = '';
  let challengeAmount = '';
  let tierName: string | null = null;
  let resolvedCatalog = catalogType;
  let resolvedAccount: ResetAccountType | null = null;
  let category: ResetCategory | null = null;

  if (resetCategory === 'challenge') {
    if (!isChallengeAccount(accountType)) return { ok: false, error: 'Reset type is invalid' };
    const expectedCatalog = CATALOG_LABEL[accountType];
    if (catalogType !== expectedCatalog) return { ok: false, error: 'Reset type is invalid' };
    if (input.tierName) return { ok: false, error: 'Reset type is invalid' };
    listCents = CHALLENGE_LIST_CENTS[accountType][input.accountSize as keyof (typeof CHALLENGE_LIST_CENTS)[ChallengeAccountType]];
    challengeType = `${expectedCatalog} Reset`;
    challengeAmount = formatSize(input.accountSize);
    category = 'challenge';
    resolvedAccount = accountType;
    resolvedCatalog = expectedCatalog;
  } else if (resetCategory === 'funded') {
    if (!isChallengeAccount(accountType)) return { ok: false, error: 'Reset type is invalid' };
    if (catalogType !== 'Funded') return { ok: false, error: 'Reset type is invalid' };
    if (input.tierName) return { ok: false, error: 'Reset type is invalid' };
    listCents = FUNDED_LIST_CENTS[input.accountSize];
    challengeType = 'Funded Reset';
    challengeAmount = formatSize(input.accountSize);
    category = 'funded';
    resolvedAccount = accountType;
    resolvedCatalog = 'Funded';
  } else if (resetCategory === 'vip') {
    if (accountType !== 'vip' || catalogType !== 'VIP') return { ok: false, error: 'Reset type is invalid' };
    const row = VIP_LIST.find((item) => item.accountSize === input.accountSize);
    if (!row) return { ok: false, error: 'Choose a valid account size' };
    if (input.tierName !== row.tierName) return { ok: false, error: 'Reset type is invalid' };
    listCents = row.listCents;
    challengeType = 'VIP Reset';
    challengeAmount = row.challengeAmount;
    tierName = row.tierName;
    category = 'vip';
    resolvedAccount = 'vip';
    resolvedCatalog = 'VIP';
  } else {
    return { ok: false, error: 'Reset type is invalid' };
  }

  if (listCents === undefined || !category || !resolvedAccount) {
    return { ok: false, error: 'Choose a valid account size' };
  }

  const discountPercent = category === 'funded' ? 0 : 20;
  const amountCents = chargeCents(listCents, discountPercent);
  if (!Number.isInteger(amountCents) || amountCents < 50) {
    return { ok: false, error: 'This order total cannot be charged by card' };
  }

  return {
    ok: true,
    priced: {
      resetCategory: category,
      accountType: resolvedAccount,
      accountSize: input.accountSize,
      catalogType: resolvedCatalog,
      challengeType,
      challengeAmount,
      resetType: resetTypeLabel(category, resolvedCatalog, tierName),
      tierName,
      platform: platformRaw,
      discountPercent,
      originalCents: listCents,
      amountCents,
    },
  };
}

function text(value: unknown, max: number, label: string, required: boolean): { ok: true; value: string } | { ok: false; error: string } {
  if (value === undefined || value === null || value === '') {
    if (!required) return { ok: true, value: '' };
    return { ok: false, error: `${label} is required` };
  }
  if (typeof value !== 'string') return { ok: false, error: `${label} is invalid` };
  const trimmed = value.trim();
  if (!trimmed) {
    if (!required) return { ok: true, value: '' };
    return { ok: false, error: `${label} is required` };
  }
  if (trimmed.length > max || /[\u0000-\u001f]/.test(trimmed)) {
    return { ok: false, error: `${label} is invalid` };
  }
  return { ok: true, value: trimmed };
}

function readTier(value: unknown): { ok: true; value: string | null } | { ok: false; error: string } {
  if (value === undefined || value === null || value === '') return { ok: true, value: null };
  if (typeof value !== 'string') return { ok: false, error: 'Reset type is invalid' };
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  if (trimmed.length > 40 || /[\u0000-\u001f]/.test(trimmed)) return { ok: false, error: 'Reset type is invalid' };
  return { ok: true, value: trimmed };
}

function readAccountId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const id = value.trim();
  if (!id || id.length > 200 || id.startsWith('PLACEHOLDER_')) return null;
  if (/[\s/\\]/.test(id) || /[\u0000-\u001f]/.test(id)) return null;
  return id;
}

export function evaluateResetHandoff(body: Record<string, unknown>): { ok: true; order: ResetOrder } | { ok: false; error: string } {
  if (body.orderKind !== 'account-reset') return { ok: false, error: 'This payment link is not a reset' };

  const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim().toLowerCase() : '';
  if (!KEY_PATTERN.test(idempotencyKey)) return { ok: false, error: 'Checkout attempt is invalid' };

  const localOrderId = typeof body.localOrderId === 'string' ? body.localOrderId.trim() : '';
  if (!ORDER_ID_PATTERN.test(localOrderId)) return { ok: false, error: 'Reset order was not found.' };

  const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
  if (!USER_PATTERN.test(userId)) return { ok: false, error: 'Account is required' };

  const accountId = readAccountId(body.accountId);
  if (!accountId) return { ok: false, error: 'Choose a real trading account to reset.' };

  if (typeof body.accountSize !== 'number' || !Number.isInteger(body.accountSize)) {
    return { ok: false, error: 'Choose a valid account size' };
  }

  let accountStep: number | null = null;
  if (body.accountStep !== undefined && body.accountStep !== null) {
    if (typeof body.accountStep !== 'number' || !Number.isInteger(body.accountStep) || body.accountStep < 0 || body.accountStep > 20) {
      return { ok: false, error: 'Reset details are invalid' };
    }
    accountStep = body.accountStep;
  }

  const accountStatusResult = text(body.accountStatus, 40, 'Account status', false);
  if (!accountStatusResult.ok) return accountStatusResult;

  const tierResult = readTier(body.tierName);
  if (!tierResult.ok) return tierResult;

  const platform = typeof body.platform === 'string' ? body.platform : '';
  const priced = priceResetSelection({
    resetCategory: typeof body.resetCategory === 'string' ? body.resetCategory : '',
    accountType: typeof body.accountType === 'string' ? body.accountType : '',
    accountSize: body.accountSize,
    catalogType: typeof body.catalogType === 'string' ? body.catalogType : '',
    tierName: tierResult.value,
    platform,
  });
  if (!priced.ok) return priced;

  const challengeType = typeof body.challengeType === 'string' ? body.challengeType.trim() : '';
  const challengeAmount = typeof body.challengeAmount === 'string' ? body.challengeAmount.trim() : '';
  if (challengeType !== priced.priced.challengeType || challengeAmount !== priced.priced.challengeAmount) {
    return { ok: false, error: 'Reset type is invalid' };
  }
  if (body.discountPercent !== priced.priced.discountPercent) {
    return { ok: false, error: 'The reset total does not match the price on this portal.' };
  }
  if (!Array.isArray(body.addOns) || body.addOns.length !== 0) {
    return { ok: false, error: 'This payment does not include add-ons' };
  }
  if (typeof body.currency !== 'string' || body.currency.trim().toLowerCase() !== 'usd') {
    return { ok: false, error: 'Currency must be usd' };
  }
  if (typeof body.originalPrice !== 'number' || !Number.isFinite(body.originalPrice)) {
    return { ok: false, error: 'Original price is required' };
  }
  if (typeof body.expectedAmount !== 'number' || !Number.isFinite(body.expectedAmount)) {
    return { ok: false, error: 'Expected amount is required' };
  }
  if (typeof body.expectedAmountCents !== 'number' || !Number.isInteger(body.expectedAmountCents)) {
    return { ok: false, error: 'Expected amount is required' };
  }
  if (
    Math.round(body.originalPrice * 100) !== priced.priced.originalCents ||
    Math.round(body.expectedAmount * 100) !== priced.priced.amountCents ||
    body.expectedAmountCents !== priced.priced.amountCents
  ) {
    return { ok: false, error: 'The reset total does not match the price on this portal.' };
  }

  const firstName = text(body.firstName, 80, 'First name', true);
  if (!firstName.ok) return firstName;
  const lastName = text(body.lastName, 80, 'Last name', true);
  if (!lastName.ok) return lastName;
  const email = text(body.email, 254, 'Email', true);
  if (!email.ok) return email;
  if (!EMAIL_PATTERN.test(email.value)) return { ok: false, error: 'A valid email is required' };
  const phone = text(body.phone, 40, 'Phone number', true);
  if (!phone.ok) return phone;
  const digits = phone.value.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return { ok: false, error: 'Enter a valid phone number' };
  const country = text(body.country, 80, 'Country', true);
  if (!country.ok) return country;
  if (country.value.length < 2) return { ok: false, error: 'Country is required' };
  const discord = text(body.discordUsername, 80, 'Discord username', false);
  if (!discord.ok) return discord;

  if (body.termsAccepted !== true || body.freshStartAccepted !== true) {
    return { ok: false, error: 'Terms were not accepted' };
  }

  const returnUrl = typeof body.returnUrl === 'string' ? body.returnUrl.trim() : '';
  const cancelUrl = typeof body.cancelUrl === 'string' ? body.cancelUrl.trim() : '';
  if (!isAllowedResetRedirect(returnUrl) || !isAllowedResetRedirect(cancelUrl)) {
    return { ok: false, error: 'Return address is invalid' };
  }

  return {
    ok: true,
    order: {
      ...priced.priced,
      idempotencyKey,
      localOrderId,
      userId,
      accountId,
      accountStep,
      accountStatus: accountStatusResult.value,
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      phone: phone.value,
      country: country.value,
      discordUsername: discord.value,
      returnUrl,
      cancelUrl,
    },
  };
}

const STANDARD_CHARGE: Record<number, number> = {
  5000: 7080,
  10000: 13080,
  25000: 22680,
  50000: 34680,
  100000: 59880,
  200000: 113880,
  500000: 227880,
};
const ONE_STEP_CHARGE: Record<number, number> = {
  5000: 7800,
  10000: 14280,
  25000: 23880,
  50000: 34680,
  100000: 68280,
  200000: 118680,
  500000: 239880,
};
const INSTANT_CHARGE: Record<number, number> = {
  5000: 35880,
  10000: 65880,
  25000: 89880,
  50000: 107880,
  100000: 215880,
  200000: 419880,
  500000: 839880,
};
const FUNDED_CHARGE: Record<number, number> = {
  10000: 19900,
  25000: 29900,
  50000: 49900,
  100000: 79900,
  200000: 149900,
  500000: 299900,
};
const VIP_CHARGE: Record<number, number> = {
  1000000: 439920,
  1500000: 599960,
  2000000: 799920,
  3000000: 1199920,
};

function assertTable(
  label: string,
  list: Record<number, number>,
  expected: Record<number, number>,
  selection: Omit<Parameters<typeof priceResetSelection>[0], 'accountSize' | 'platform' | 'tierName'> & {
    tierName?: string | null;
    challengeAmount?: (size: number) => string;
  }
) {
  const sizes = Object.keys(list)
    .map(Number)
    .sort((a, b) => a - b);
  const expectedSizes = Object.keys(expected)
    .map(Number)
    .sort((a, b) => a - b);
  if (sizes.join(',') !== expectedSizes.join(',')) {
    throw new Error(`Reset price sizes drifted for ${label}`);
  }
  for (const accountSize of sizes) {
    const priced = priceResetSelection({
      resetCategory: selection.resetCategory,
      accountType: selection.accountType,
      catalogType: selection.catalogType,
      tierName: selection.tierName === undefined ? null : selection.tierName,
      platform: 'MT5',
      accountSize,
    });
    if (!priced.ok || priced.priced.originalCents !== list[accountSize] || priced.priced.amountCents !== expected[accountSize]) {
      throw new Error(`Reset price mismatch for ${label} ${accountSize}`);
    }
    if (selection.challengeAmount && priced.priced.challengeAmount !== selection.challengeAmount(accountSize)) {
      throw new Error(`Reset label mismatch for ${label} ${accountSize}`);
    }
  }
}

function customerBody(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    idempotencyKey: '11111111-1111-4111-8111-111111111111',
    localOrderId: 'abcdefghijklmnopqrst',
    orderKind: 'account-reset',
    userId: 'firebaseUid123456',
    accountId: 'acct-100',
    accountStep: 1,
    accountStatus: 'active',
    addOns: [],
    currency: 'usd',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '+1 555 123 4567',
    country: 'United States',
    discordUsername: 'ada',
    termsAccepted: true,
    freshStartAccepted: true,
    returnUrl: 'https://shockwave-capital.com/dashboard/accounts?reset=paid',
    cancelUrl: 'https://shockwave-capital.com/dashboard/accounts',
    platform: 'MT4',
    ...overrides,
  };
}

function assertResetPriceSchedule() {
  if (Math.round(19.99 * 100) !== 1999) throw new Error('Gauntlet list cents drifted');
  if (chargeCents(1999, 20) !== 1599) throw new Error('Gauntlet charge cents drifted');
  if (Math.round(VIP_3M_LIST_CENTS / 2) !== 749950) throw new Error('VIP 1.5M list cents drifted');

  assertTable('standard', CHALLENGE_LIST_CENTS.standard, STANDARD_CHARGE, {
    resetCategory: 'challenge',
    accountType: 'standard',
    catalogType: 'Standard',
    challengeAmount: (size) => `$${size.toLocaleString('en-US')}`,
  });
  assertTable('1-step', CHALLENGE_LIST_CENTS['1-step'], ONE_STEP_CHARGE, {
    resetCategory: 'challenge',
    accountType: '1-step',
    catalogType: '1-Step',
    challengeAmount: (size) => `$${size.toLocaleString('en-US')}`,
  });
  assertTable('instant', CHALLENGE_LIST_CENTS.instant, INSTANT_CHARGE, {
    resetCategory: 'challenge',
    accountType: 'instant',
    catalogType: 'Instant',
    challengeAmount: (size) => `$${size.toLocaleString('en-US')}`,
  });
  assertTable(
    'gauntlet',
    CHALLENGE_LIST_CENTS.gauntlet,
    { 10000: 1599, 25000: 1599, 50000: 1599, 100000: 1599, 200000: 1599, 500000: 1599 },
    {
      resetCategory: 'challenge',
      accountType: 'gauntlet',
      catalogType: 'Gauntlet',
      challengeAmount: (size) => `$${size.toLocaleString('en-US')}`,
    }
  );
  assertTable('funded', FUNDED_LIST_CENTS, FUNDED_CHARGE, {
    resetCategory: 'funded',
    accountType: 'standard',
    catalogType: 'Funded',
    challengeAmount: (size) => `$${size.toLocaleString('en-US')}`,
  });

  for (const row of VIP_LIST) {
    const priced = priceResetSelection({
      resetCategory: 'vip',
      accountType: 'vip',
      accountSize: row.accountSize,
      catalogType: 'VIP',
      tierName: row.tierName,
      platform: 'MT4',
    });
    if (!priced.ok || priced.priced.amountCents !== VIP_CHARGE[row.accountSize] || priced.priced.challengeAmount !== row.challengeAmount) {
      throw new Error(`VIP reset price mismatch for ${row.challengeAmount}`);
    }
    if (priced.priced.resetType !== `${row.tierName} reset`) {
      throw new Error(`VIP reset label mismatch for ${row.challengeAmount}`);
    }
  }

  const vip = evaluateResetHandoff(
    customerBody({
      resetCategory: 'vip',
      accountType: 'vip',
      accountSize: 1500000,
      catalogType: 'VIP',
      challengeType: 'VIP Reset',
      challengeAmount: '$1.5M',
      tierName: 'VIP',
      originalPrice: 7499.5,
      discountPercent: 20,
      expectedAmount: 5999.6,
      expectedAmountCents: 599960,
    })
  );
  if (!vip.ok || vip.order.amountCents !== 599960 || vip.order.originalCents !== 749950) {
    throw new Error('VIP 1.5M handoff failed the locked fee check');
  }

  const wrongCents = evaluateResetHandoff(
    customerBody({
      resetCategory: 'vip',
      accountType: 'vip',
      accountSize: 1500000,
      catalogType: 'VIP',
      challengeType: 'VIP Reset',
      challengeAmount: '$1.5M',
      tierName: 'VIP',
      originalPrice: 7499.5,
      discountPercent: 20,
      expectedAmount: 5999.6,
      expectedAmountCents: 599959,
    })
  );
  if (wrongCents.ok) throw new Error('A mismatched reset total was accepted');

  const gauntlet = evaluateResetHandoff(
    customerBody({
      resetCategory: 'challenge',
      accountType: 'gauntlet',
      accountSize: 10000,
      catalogType: 'Gauntlet',
      challengeType: 'Gauntlet Reset',
      challengeAmount: '$10,000',
      tierName: null,
      originalPrice: 19.99,
      discountPercent: 20,
      expectedAmount: 15.99,
      expectedAmountCents: 1599,
    })
  );
  if (!gauntlet.ok || gauntlet.order.amountCents !== 1599) throw new Error('Gauntlet reset handoff failed');

  const funded = evaluateResetHandoff(
    customerBody({
      resetCategory: 'funded',
      accountType: 'gauntlet',
      accountSize: 500000,
      catalogType: 'Funded',
      challengeType: 'Funded Reset',
      challengeAmount: '$500,000',
      tierName: null,
      originalPrice: 2999,
      discountPercent: 0,
      expectedAmount: 2999,
      expectedAmountCents: 299900,
    })
  );
  if (!funded.ok || funded.order.amountCents !== 299900 || funded.order.discountPercent !== 0) {
    throw new Error('Funded reset handoff failed');
  }
}

assertResetPriceSchedule();
