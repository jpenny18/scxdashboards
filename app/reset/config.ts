/**
 * Card checkout for an account reset that was already priced on Shockwave.
 *
 * Shockwave calls `POST /reset/api/handoff` with CHECKOUT_HANDOFF_SECRET, then
 * sends the browser to `/reset?ref=...`. This portal recomputes the fee.
 * Stripe receives the amount and contact details only.
 *
 * Uses the same Stripe account as /checkout and /vip (VIPSK / VIPPK) and the
 * same public origin (CHECKOUT_PUBLIC_URL).
 */

export const RESET = {
  integrationId: 'reset_checkout',
  currency: 'usd',
  returnPath: '/reset/return',
  /** Shown on the Stripe charge. No account, size, platform, or reset type. */
  stripeProductName: 'Reset Fee',
  stripeProductDescription: 'One-time fee',
  handoffTtlMs: 24 * 60 * 60 * 1000,
  minChargeCents: 50,
} as const;

export function formatUsdFromCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
