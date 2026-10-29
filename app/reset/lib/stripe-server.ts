import { RESET } from '../config';
import {
  hideStripeLink,
  isCheckoutSessionId,
  paymentIntentIdOf,
  stripeRequest,
  withoutStripeLink,
  type VipCheckoutSession,
} from '../../vip/lib/stripe-server';

export type ResetCheckoutSession = VipCheckoutSession;

export { hideStripeLink, isCheckoutSessionId, paymentIntentIdOf };

export type ResetContact = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  country: string;
  discordUsername: string;
};

function meta(value: string): string {
  return value.replace(/[\r\n]/g, ' ').trim().slice(0, 500);
}

export function resetCheckoutForm(amountCents: number, origin: string, customer: ResetContact, includeCustomerEmail: boolean) {
  const params = new URLSearchParams();
  params.set('ui_mode', 'elements');
  params.set('mode', 'payment');
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', RESET.currency);
  params.set('line_items[0][price_data][unit_amount]', String(amountCents));
  params.set('line_items[0][price_data][product_data][name]', RESET.stripeProductName);
  params.set('line_items[0][price_data][product_data][description]', RESET.stripeProductDescription);
  params.set('return_url', `${origin}${RESET.returnPath}?session_id={CHECKOUT_SESSION_ID}`);
  params.set('billing_address_collection', 'auto');
  params.set('integration_identifier', RESET.integrationId);
  withoutStripeLink(params);
  if (includeCustomerEmail) params.set('customer_email', customer.email.trim());
  params.set('metadata[email]', meta(customer.email));
  params.set('metadata[phone]', meta(customer.phone));
  params.set('metadata[first_name]', meta(customer.firstName));
  params.set('metadata[last_name]', meta(customer.lastName));
  params.set('metadata[country]', meta(customer.country));
  params.set('metadata[discord]', meta(customer.discordUsername));
  return params;
}

export async function createResetCheckoutSession(
  amountCents: number,
  origin: string,
  customer: ResetContact
): Promise<ResetCheckoutSession> {
  try {
    return await stripeRequest<ResetCheckoutSession>('/checkout/sessions', resetCheckoutForm(amountCents, origin, customer, true));
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!/email/i.test(message)) throw error;
    return stripeRequest<ResetCheckoutSession>('/checkout/sessions', resetCheckoutForm(amountCents, origin, customer, false));
  }
}

export async function retrieveResetCheckoutSession(sessionId: string): Promise<ResetCheckoutSession> {
  return stripeRequest<ResetCheckoutSession>(
    `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent`,
    undefined,
    'GET'
  );
}

function assertStripeChargeStaysGeneric() {
  const params = resetCheckoutForm(
    599960,
    'https://www.scxdashboards.com',
    {
      email: 'buyer@example.com',
      phone: '+15551234567',
      firstName: 'Ada',
      lastName: 'Lovelace',
      country: 'Canada',
      discordUsername: '',
    },
    true
  );
  if (params.get('line_items[0][price_data][product_data][name]') !== 'Reset Fee') {
    throw new Error('Reset Stripe product name drifted');
  }
  if (params.get('line_items[0][price_data][product_data][description]') !== 'One-time fee') {
    throw new Error('Reset Stripe product description drifted');
  }
  if (params.get('line_items[0][price_data][currency]') !== 'usd') throw new Error('Reset Stripe currency drifted');
  if (params.get('line_items[0][price_data][unit_amount]') !== '599960') throw new Error('Reset Stripe amount drifted');

  const metadataKeys = Array.from(params.keys())
    .filter((key) => key.startsWith('metadata['))
    .sort();
  const expectedKeys = ['metadata[country]', 'metadata[discord]', 'metadata[email]', 'metadata[first_name]', 'metadata[last_name]', 'metadata[phone]'];
  if (metadataKeys.join(',') !== expectedKeys.join(',')) throw new Error('Reset Stripe metadata drifted');

  const raw = params.toString().toLowerCase();
  const banned = [
    'challenge',
    'funded',
    'allocation',
    'gauntlet',
    'mt4',
    'mt5',
    'platform',
    'tier',
    'account',
    'vip',
    'standard',
    'instant',
    'professional',
    'shockwavetrading.com',
    'shockwave-capital.com',
  ];
  for (const word of banned) {
    if (raw.includes(word)) throw new Error(`Reset Stripe charge includes ${word}`);
  }
}

assertStripeChargeStaysGeneric();
