/**
 * Price table for challenge card checkout.
 * Keep this identical to `calculatePrice` on the challenge site.
 * Add-ons are free, matching the promo on that form (`calculateAddOnsPrice`).
 * If that promo ends, set ADD_ONS_FREE to false. Both sites must change together.
 * The form sends `expectedAmount` and this portal refuses the handoff when the
 * two totals differ, so a drifted table cannot charge a different price.
 */

export const ADD_ONS_FREE = true;

export const CHALLENGE_TYPES = ['Standard', '1-Step', 'Instant', 'Gauntlet'] as const;
export type ChallengeType = (typeof CHALLENGE_TYPES)[number];

export const PLATFORMS = ['MT4', 'MT5'] as const;
export type Platform = (typeof PLATFORMS)[number];

const ADD_ON_MULTIPLIER: Record<string, number> = {
  'no-min-days': 0.3,
  'profit-split-100': 0.3,
};

const PRICES: Record<ChallengeType, Record<number, number>> = {
  Standard: {
    5000: 88.5,
    10000: 163.5,
    25000: 283.5,
    50000: 433.5,
    100000: 748.5,
    200000: 1423.5,
    500000: 2848.5,
  },
  '1-Step': {
    5000: 97.5,
    10000: 178.5,
    25000: 298.5,
    50000: 433.5,
    100000: 853.5,
    200000: 1483.5,
    500000: 2998.5,
  },
  Instant: {
    5000: 448.5,
    10000: 823.5,
    25000: 1123.5,
    50000: 1348.5,
    100000: 2698.5,
    200000: 5248.5,
    500000: 10498.5,
  },
  Gauntlet: {
    10000: 19.99,
    25000: 19.99,
    50000: 19.99,
    100000: 19.99,
    200000: 19.99,
    500000: 19.99,
  },
};

export type PortalDiscount = {
  type: 'percentage' | 'fixed';
  value: number;
};

export type PricedSelection = {
  challengeType: ChallengeType;
  challengeAmount: string;
  accountSize: number;
  platform: Platform;
  addOns: string[];
  originalCents: number;
  amountCents: number;
};

function isChallengeType(value: string): value is ChallengeType {
  return (CHALLENGE_TYPES as readonly string[]).includes(value);
}

function readAccountSize(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  if (typeof value !== 'string') return null;
  const digits = value.replace(/[$,\s]/g, '');
  if (!/^\d+$/.test(digits)) return null;
  const size = Number(digits);
  if (!Number.isInteger(size) || size <= 0) return null;
  return size;
}

function formatAccountSize(size: number): string {
  return `$${size.toLocaleString('en-US')}`;
}

export function priceSelection(
  input: {
    challengeType: unknown;
    challengeAmount: unknown;
    platform: unknown;
    addOns: unknown;
  },
  discount: PortalDiscount | null
): { ok: true; selection: PricedSelection } | { ok: false; error: string } {
  const challengeType = typeof input.challengeType === 'string' ? input.challengeType.trim() : '';
  if (!isChallengeType(challengeType)) return { ok: false, error: 'Choose a valid challenge' };

  const accountSize = readAccountSize(input.challengeAmount);
  const base = accountSize === null ? undefined : PRICES[challengeType][accountSize];
  if (accountSize === null || base === undefined) return { ok: false, error: 'Choose a valid account size' };

  const platformRaw = typeof input.platform === 'string' ? input.platform.trim().toUpperCase() : '';
  if (!(PLATFORMS as readonly string[]).includes(platformRaw)) {
    return { ok: false, error: 'Platform selection is required' };
  }

  if (!Array.isArray(input.addOns)) return { ok: false, error: 'Add-ons are invalid' };
  const addOns: string[] = [];
  for (const entry of input.addOns) {
    if (typeof entry !== 'string' || !Object.prototype.hasOwnProperty.call(ADD_ON_MULTIPLIER, entry)) {
      return { ok: false, error: 'Unknown add-on' };
    }
    if (!addOns.includes(entry)) addOns.push(entry);
  }
  addOns.sort();

  let original = base;
  if (!ADD_ONS_FREE) {
    const multiplier = addOns.reduce((sum, id) => sum + ADD_ON_MULTIPLIER[id], 0);
    original += base * multiplier;
  }

  let charged = original;
  if (discount?.type === 'percentage') {
    charged = original * (1 - discount.value / 100);
  } else if (discount?.type === 'fixed') {
    charged = Math.max(0, original - discount.value);
  }

  const originalCents = Math.round(original * 100);
  const amountCents = Math.round(charged * 100);
  if (!Number.isInteger(amountCents) || amountCents < 50) {
    return { ok: false, error: 'This order total cannot be charged by card' };
  }

  return {
    ok: true,
    selection: {
      challengeType,
      challengeAmount: formatAccountSize(accountSize),
      accountSize,
      platform: platformRaw as Platform,
      addOns,
      originalCents,
      amountCents,
    },
  };
}
