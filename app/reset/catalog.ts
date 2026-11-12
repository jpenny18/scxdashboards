/**
 * Reset fee table. Shockwave sends one locked order. The charge is the
 * built-in fee unless settings/reset-prices has an override. A percent-off
 * charge is Math.round(fullCents * (100 - percent) / 100), taken off the list
 * price. Stripe never receives this table.
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
  if (!discountPercent) return listCents;
  return Math.round((listCents * (100 - discountPercent)) / 100);
}

const MIN_CHARGE_CENTS = 50;
const MAX_FIXED_PRICE = 100_000;

export type ResetPriceRule =
  | { mode: 'discount'; discountPercent: number }
  | { mode: 'fixed'; price: number };

export type ResetPriceSnapshot = {
  global: Record<string, ResetPriceRule>;
  users: Record<string, { catalog: Record<string, ResetPriceRule>; accounts: Record<string, ResetPriceRule> }>;
};

export type ResetAccountRecord = {
  accountId: string;
  accountType?: unknown;
  accountSize?: unknown;
  platform?: unknown;
  status?: unknown;
  step?: unknown;
};

export function emptyResetPriceSnapshot(): ResetPriceSnapshot {
  return { global: {}, users: {} };
}

export function resetCatalogKey(priced: Pick<PricedReset, 'resetCategory' | 'accountType' | 'accountSize'>): string {
  if (priced.resetCategory === 'funded') return `funded:*:${priced.accountSize}`;
  if (priced.resetCategory === 'vip') return `vip:vip:${priced.accountSize}`;
  return `challenge:${priced.accountType}:${priced.accountSize}`;
}

function readAccountSize(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const size = Math.round(value);
    return size > 0 ? size : null;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[$,\s]/g, ''));
    if (Number.isFinite(parsed) && parsed > 0) return Math.round(parsed);
  }
  return null;
}

function normalizeAccountType(value: unknown): string {
  return String(value || '').trim().toLowerCase().replace(/[\s_]/g, '-');
}

function formatPlatform(value: unknown): 'MT4' | 'MT5' {
  const platform = String(value || '').trim().toLowerCase();
  if (platform.includes('mt4') || platform === '4') return 'MT4';
  return 'MT5';
}

function vipTierName(size: number): string | null {
  if (size === 1000000) return 'Professional';
  if (size === 1500000) return 'VIP';
  if (size === 2000000) return 'Executive';
  if (size === 3000000) return 'Institutional';
  return null;
}

function challengeAccountType(value: string): ChallengeAccountType | null {
  if (value === '1step' || value === 'onestep' || value === 'one-step') return '1-step';
  if (value === 'standard' || value === 'instant' || value === 'gauntlet' || value === '1-step') return value;
  return null;
}

export function builtinQuoteForAccount(
  account: Omit<ResetAccountRecord, 'accountId'>
): { ok: true; priced: PricedReset } | { ok: false; error: string } {
  const size = readAccountSize(account.accountSize);
  if (size === null) return { ok: false, error: 'Choose a valid account size' };
  const type = normalizeAccountType(account.accountType);
  const step = Number(account.step);
  const status = String(account.status || '').trim().toLowerCase();
  const funded = step === 3 || status === 'funded';
  const platform = formatPlatform(account.platform);

  if (type === 'vip' || size > 500000) {
    return priceResetSelection({
      resetCategory: 'vip',
      accountType: 'vip',
      accountSize: size,
      catalogType: 'VIP',
      tierName: vipTierName(size),
      platform,
    });
  }

  const accountType = challengeAccountType(type);
  if (!accountType) return { ok: false, error: 'Reset type is invalid' };
  if (funded) {
    return priceResetSelection({
      resetCategory: 'funded',
      accountType,
      accountSize: size,
      catalogType: 'Funded',
      tierName: null,
      platform,
    });
  }
  return priceResetSelection({
    resetCategory: 'challenge',
    accountType,
    accountSize: size,
    catalogType: CATALOG_LABEL[accountType],
    tierName: null,
    platform,
  });
}

function parseStoredRule(value: unknown): ResetPriceRule | null {
  if (!value || typeof value !== 'object') return null;
  const mode = (value as { mode?: unknown }).mode;
  if (mode === 'discount') {
    const percent = Number((value as { discountPercent?: unknown }).discountPercent);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) return null;
    return { mode: 'discount', discountPercent: Math.round(percent * 100) / 100 };
  }
  if (mode === 'fixed') {
    const price = Number((value as { price?: unknown }).price);
    if (!Number.isFinite(price) || price < MIN_CHARGE_CENTS / 100 || price > MAX_FIXED_PRICE) return null;
    return { mode: 'fixed', price: Math.round(price * 100) / 100 };
  }
  return null;
}

function listCentsForCatalogKey(key: string): number | null {
  const [category, type, sizeRaw] = key.split(':');
  const size = Number(sizeRaw);
  if (!Number.isInteger(size) || key.split(':').length !== 3) return null;
  if (category === 'funded' && type === '*') return FUNDED_LIST_CENTS[size] ?? null;
  if (category === 'vip' && type === 'vip') return VIP_LIST.find((row) => row.accountSize === size)?.listCents ?? null;
  if (category === 'challenge') {
    const accountType = challengeAccountType(type);
    if (!accountType) return null;
    return CHALLENGE_LIST_CENTS[accountType][size as keyof (typeof CHALLENGE_LIST_CENTS)[ChallengeAccountType]] ?? null;
  }
  return null;
}

function usableCatalogRule(key: string, value: unknown): ResetPriceRule | null {
  const listCents = listCentsForCatalogKey(key);
  const rule = parseStoredRule(value);
  if (listCents === undefined || listCents === null || !rule) return null;
  return chargeCentsForRule(listCents, rule) === null ? null : rule;
}

function chargeCentsForRule(listCents: number, rule: ResetPriceRule): number | null {
  const cents = rule.mode === 'discount'
    ? chargeCents(listCents, rule.discountPercent)
    : Math.round(rule.price * 100);
  if (!Number.isInteger(cents) || cents < MIN_CHARGE_CENTS) return null;
  return cents;
}

function displayDiscountPercent(listCents: number, chargeCents: number, rule: ResetPriceRule): number {
  if (rule.mode === 'discount') return rule.discountPercent;
  const original = listCents / 100;
  const price = chargeCents / 100;
  if (price < original - 0.001) return Math.max(1, Math.round((1 - price / original) * 100));
  return 0;
}

function readRuleMap(value: unknown, catalogKeysOnly: boolean): Record<string, ResetPriceRule> {
  const rules: Record<string, ResetPriceRule> = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return rules;
  for (const [key, ruleValue] of Object.entries(value as Record<string, unknown>)) {
    const rule = catalogKeysOnly ? usableCatalogRule(key, ruleValue) : parseStoredRule(ruleValue);
    if (rule) rules[key] = rule;
  }
  return rules;
}

export function readResetPriceSnapshot(data: unknown): ResetPriceSnapshot {
  const snapshot = emptyResetPriceSnapshot();
  if (!data || typeof data !== 'object') return snapshot;
  const raw = data as { global?: unknown; users?: unknown };
  snapshot.global = readRuleMap(raw.global, true);
  if (!raw.users || typeof raw.users !== 'object' || Array.isArray(raw.users)) return snapshot;
  for (const [userId, value] of Object.entries(raw.users as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const record = value as { catalog?: unknown; accounts?: unknown };
    const catalog = readRuleMap(record.catalog, true);
    const accounts = readRuleMap(record.accounts, false);
    if (Object.keys(catalog).length === 0 && Object.keys(accounts).length === 0) continue;
    snapshot.users[userId] = { catalog, accounts };
  }
  return snapshot;
}

export function resolveResetCharge(
  account: ResetAccountRecord,
  config: ResetPriceSnapshot | null | undefined,
  userId: string
): { ok: true; priced: PricedReset } | { ok: false; error: string } {
  const base = builtinQuoteForAccount(account);
  if (!base.ok) return base;
  const key = resetCatalogKey(base.priced);
  const storedUser = config?.users?.[userId];
  const layers = [
    storedUser?.accounts?.[account.accountId],
    storedUser?.catalog?.[key],
    config?.global?.[key],
  ];
  let amountCents = base.priced.amountCents;
  let discountPercent = base.priced.discountPercent;
  for (const rule of layers) {
    if (!rule) continue;
    const cents = chargeCentsForRule(base.priced.originalCents, rule);
    if (cents === null) continue;
    amountCents = cents;
    discountPercent = displayDiscountPercent(base.priced.originalCents, cents, rule);
    break;
  }
  return { ok: true, priced: { ...base.priced, amountCents, discountPercent } };
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
  if (typeof body.discountPercent !== 'number' || !Number.isFinite(body.discountPercent) || body.discountPercent < 0 || body.discountPercent > 100) {
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
  if (body.expectedAmountCents < MIN_CHARGE_CENTS || Math.round(body.expectedAmount * 100) !== body.expectedAmountCents) {
    return { ok: false, error: 'The reset total does not match the price on this portal.' };
  }
  if (Math.round(body.originalPrice * 100) !== priced.priced.originalCents) {
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
      discountPercent: body.discountPercent,
      amountCents: body.expectedAmountCents,
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

export function verifyResetHandoff(
  body: Record<string, unknown>,
  account: ResetAccountRecord,
  config: ResetPriceSnapshot | null | undefined
): { ok: true; order: ResetOrder } | { ok: false; error: string } {
  const parsed = evaluateResetHandoff(body);
  if (!parsed.ok) return parsed;
  const resolved = resolveResetCharge(account, config, parsed.order.userId);
  if (!resolved.ok) return resolved;
  const order = parsed.order;
  const priced = resolved.priced;
  const sameProduct =
    order.resetCategory === priced.resetCategory &&
    order.accountType === priced.accountType &&
    order.accountSize === priced.accountSize &&
    order.catalogType === priced.catalogType &&
    order.platform === priced.platform &&
    order.challengeType === priced.challengeType &&
    order.challengeAmount === priced.challengeAmount &&
    (order.tierName || '') === (priced.tierName || '') &&
    order.originalCents === priced.originalCents &&
    order.amountCents === priced.amountCents &&
    order.discountPercent === priced.discountPercent;
  if (!sameProduct) return { ok: false, error: 'The reset total does not match the price on this portal.' };
  return { ok: true, order: { ...order, amountCents: priced.amountCents, discountPercent: priced.discountPercent, originalCents: priced.originalCents } };
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

  const emptyPrices = emptyResetPriceSnapshot();
  const accountFor = (body: Record<string, unknown>): ResetAccountRecord => ({
    accountId: String(body.accountId),
    accountType: body.accountType,
    accountSize: body.accountSize,
    status: body.resetCategory === 'funded' ? 'funded' : 'active',
    step: body.resetCategory === 'funded' ? 3 : body.accountStep,
    platform: body.platform,
  });

  const vip = verifyResetHandoff(
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
    }),
    accountFor({
      accountId: 'acct-100',
      accountType: 'vip',
      accountSize: 1500000,
      resetCategory: 'vip',
      accountStep: 1,
      platform: 'MT4',
    }),
    emptyPrices
  );
  if (!vip.ok || vip.order.amountCents !== 599960 || vip.order.originalCents !== 749950) {
    throw new Error('VIP 1.5M handoff failed the locked fee check');
  }

  const wrongCents = verifyResetHandoff(
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
    }),
    accountFor({
      accountId: 'acct-100',
      accountType: 'vip',
      accountSize: 1500000,
      resetCategory: 'vip',
      accountStep: 1,
      platform: 'MT4',
    }),
    emptyPrices
  );
  if (wrongCents.ok) throw new Error('A mismatched reset total was accepted');

  const gauntlet = verifyResetHandoff(
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
    }),
    accountFor({
      accountId: 'acct-100',
      accountType: 'gauntlet',
      accountSize: 10000,
      resetCategory: 'challenge',
      accountStep: 1,
      platform: 'MT4',
    }),
    emptyPrices
  );
  if (!gauntlet.ok || gauntlet.order.amountCents !== 1599) throw new Error('Gauntlet reset handoff failed');

  const funded = verifyResetHandoff(
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
    }),
    accountFor({
      accountId: 'acct-100',
      accountType: 'gauntlet',
      accountSize: 500000,
      resetCategory: 'funded',
      accountStep: 3,
      platform: 'MT4',
    }),
    emptyPrices
  );
  if (!funded.ok || funded.order.amountCents !== 299900 || funded.order.discountPercent !== 0) {
    throw new Error('Funded reset handoff failed');
  }

  const standardAccount: ResetAccountRecord = {
    accountId: 'acct-100',
    accountType: 'standard',
    accountSize: 50000,
    status: 'active',
    step: 1,
    platform: 'MT4',
  };
  const standardBody = (cents: number, percent: number) => customerBody({
    resetCategory: 'challenge',
    accountType: 'standard',
    accountSize: 50000,
    catalogType: 'Standard',
    challengeType: 'Standard Reset',
    challengeAmount: '$50,000',
    tierName: null,
    originalPrice: 433.5,
    discountPercent: percent,
    expectedAmount: cents / 100,
    expectedAmountCents: cents,
  });
  const halfOff = verifyResetHandoff(standardBody(21675, 50), standardAccount, {
    global: { 'challenge:standard:50000': { mode: 'discount', discountPercent: 50 } },
    users: {},
  });
  if (!halfOff.ok || halfOff.order.amountCents !== 21675) throw new Error('Global 50% reset price was rejected');

  const builtinRejected = verifyResetHandoff(standardBody(34680, 20), standardAccount, {
    global: { 'challenge:standard:50000': { mode: 'discount', discountPercent: 50 } },
    users: {},
  });
  if (builtinRejected.ok) throw new Error('Built-in 20% price was accepted over a custom rule');

  const fixedUser = verifyResetHandoff(standardBody(10000, 77), standardAccount, {
    global: { 'challenge:standard:50000': { mode: 'discount', discountPercent: 50 } },
    users: {
      firebaseUid123456: {
        catalog: { 'challenge:standard:50000': { mode: 'fixed', price: 100 } },
        accounts: {},
      },
    },
  });
  if (!fixedUser.ok || fixedUser.order.amountCents !== 10000 || fixedUser.order.discountPercent !== 77) {
    throw new Error('Customer fixed reset price did not win over the global rule');
  }

  const accountRule = verifyResetHandoff(standardBody(26010, 40), standardAccount, {
    global: { 'challenge:standard:50000': { mode: 'discount', discountPercent: 50 } },
    users: {
      firebaseUid123456: {
        catalog: { 'challenge:standard:50000': { mode: 'fixed', price: 100 } },
        accounts: { 'acct-100': { mode: 'discount', discountPercent: 40 } },
      },
    },
  });
  if (!accountRule.ok || accountRule.order.amountCents !== 26010) {
    throw new Error('Account reset price did not win over the customer catalog rule');
  }

  const skipped = verifyResetHandoff(
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
    }),
    {
      accountId: 'acct-100',
      accountType: 'gauntlet',
      accountSize: 10000,
      status: 'active',
      step: 1,
      platform: 'MT4',
    },
    { global: { 'challenge:gauntlet:10000': { mode: 'discount', discountPercent: 99 } }, users: {} }
  );
  if (!skipped.ok || skipped.order.amountCents !== 1599) {
    throw new Error('A reset rule below $0.50 did not fall through to the built-in price');
  }

  const tradingSite = evaluateResetHandoff(
    customerBody({
      resetCategory: 'challenge',
      accountType: 'standard',
      accountSize: 5000,
      catalogType: 'Standard',
      challengeType: 'Standard Reset',
      challengeAmount: '$5,000',
      tierName: null,
      originalPrice: 88.5,
      discountPercent: 20,
      expectedAmount: 70.8,
      expectedAmountCents: 7080,
      returnUrl: 'https://www.shockwavetrading.com/dashboard/accounts?reset=paid',
      cancelUrl: 'https://www.shockwavetrading.com/dashboard/accounts',
    })
  );
  if (!tradingSite.ok) throw new Error('shockwavetrading.com return address was refused');

  const foreignSite = evaluateResetHandoff(
    customerBody({
      resetCategory: 'challenge',
      accountType: 'standard',
      accountSize: 5000,
      catalogType: 'Standard',
      challengeType: 'Standard Reset',
      challengeAmount: '$5,000',
      tierName: null,
      originalPrice: 88.5,
      discountPercent: 20,
      expectedAmount: 70.8,
      expectedAmountCents: 7080,
      returnUrl: 'https://evil.example/dashboard/accounts?reset=paid',
      cancelUrl: 'https://www.shockwavetrading.com/dashboard/accounts',
    })
  );
  if (foreignSite.ok) throw new Error('An off-site return address was accepted');
}

assertResetPriceSchedule();
