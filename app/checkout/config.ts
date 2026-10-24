/**
 * Challenge card payments collected on this site.
 *
 * The challenge form lives on the other site. That site calls
 * `POST /checkout/api/handoff` with a shared secret, then sends the browser
 * to `/checkout?ref=...`. Prices are calculated here. Stripe only receives
 * the amount and contact details.
 *
 * Uses the same Stripe account as /vip:
 *   VIPSK  Stripe secret key
 *   VIPPK  Stripe publishable key
 *
 * Also set:
 *   CHECKOUT_HANDOFF_SECRET  shared with the challenge site, 16+ characters
 *   CHECKOUT_PUBLIC_URL      public origin of this site, no trailing slash
 *                            (example: https://dashboards.example.com)
 */

export const CHECKOUT = {
  integrationId: 'checkout_portal',
  currency: 'usd',
  returnPath: '/checkout/return',
  /** Shown on the Stripe charge. No account size, platform, or challenge name. */
  stripeProductName: 'Service Fee',
  stripeProductDescription: 'One-time fee',
  handoffTtlMs: 24 * 60 * 60 * 1000,
  minChargeCents: 50,
} as const;

export function formatUsdFromCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
