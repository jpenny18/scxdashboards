import { VIP_CHECKOUT, type VipCustomer } from '../config';

const STRIPE_API = 'https://api.stripe.com/v1';

export function vipSecretKey(): string {
  const key = process.env.VIPSK;
  if (!key) {
    throw new Error('VIPSK is not set. Add the VIP Stripe secret key to .env.');
  }
  return key;
}

export function vipPublishableKey(): string {
  return process.env.VIPPK || '';
}

type StripeErrorBody = {
  error?: { message?: string };
};

export async function stripeRequest<T>(path: string, params?: URLSearchParams, method = 'POST'): Promise<T> {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${vipSecretKey()}`,
      ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: params?.toString(),
    cache: 'no-store',
  });

  const data = (await response.json()) as T & StripeErrorBody;
  if (!response.ok) {
    throw new Error(data.error?.message || 'Stripe request failed');
  }
  return data;
}

export type VipCheckoutSession = {
  id: string;
  client_secret?: string | null;
  status?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  metadata?: Record<string, string> | null;
  payment_intent?: string | { id?: string } | null;
};

/** Hides Stripe Link and its "save my information for faster checkout" prompt. */
export function withoutStripeLink(params: URLSearchParams) {
  params.set('wallet_options[link][display]', 'never');
}

export async function hideStripeLink(sessionId: string): Promise<void> {
  const params = new URLSearchParams();
  withoutStripeLink(params);
  try {
    await stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}`, params);
  } catch (error) {
    console.error('Unable to hide saved checkout:', error instanceof Error ? error.message : error);
  }
}

export function requestOrigin(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function createVipCheckoutSession(amountCents: number, origin: string): Promise<VipCheckoutSession> {
  const params = new URLSearchParams();
  params.set('ui_mode', 'elements');
  params.set('mode', 'payment');
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', VIP_CHECKOUT.currency);
  params.set('line_items[0][price_data][unit_amount]', String(amountCents));
  params.set('line_items[0][price_data][product_data][name]', VIP_CHECKOUT.stripeProductName);
  params.set('line_items[0][price_data][product_data][description]', 'One-time activation fee');
  params.set('return_url', `${origin}${VIP_CHECKOUT.returnPath}?session_id={CHECKOUT_SESSION_ID}`);
  params.set('billing_address_collection', 'auto');
  params.set('integration_identifier', VIP_CHECKOUT.integrationId);
  withoutStripeLink(params);

  return stripeRequest<VipCheckoutSession>('/checkout/sessions', params);
}

export type VipPortalContact = {
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

export function vipPortalCheckoutForm(
  amountCents: number,
  origin: string,
  customer: VipPortalContact,
  includeCustomerEmail: boolean
) {
  const params = new URLSearchParams();
  params.set('ui_mode', 'elements');
  params.set('mode', 'payment');
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', VIP_CHECKOUT.currency);
  params.set('line_items[0][price_data][unit_amount]', String(amountCents));
  params.set('line_items[0][price_data][product_data][name]', VIP_CHECKOUT.stripeProductName);
  params.set('line_items[0][price_data][product_data][description]', 'One-time activation fee');
  params.set('return_url', `${origin}${VIP_CHECKOUT.returnPath}?session_id={CHECKOUT_SESSION_ID}`);
  params.set('billing_address_collection', 'auto');
  params.set('integration_identifier', VIP_CHECKOUT.integrationId);
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

export async function createVipPortalCheckoutSession(
  amountCents: number,
  origin: string,
  customer: VipPortalContact
): Promise<VipCheckoutSession> {
  try {
    return await stripeRequest<VipCheckoutSession>(
      '/checkout/sessions',
      vipPortalCheckoutForm(amountCents, origin, customer, true)
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!/email/i.test(message)) throw error;
    return stripeRequest<VipCheckoutSession>(
      '/checkout/sessions',
      vipPortalCheckoutForm(amountCents, origin, customer, false)
    );
  }
}

function assertVipStripeChargeStaysGeneric() {
  const params = vipPortalCheckoutForm(
    549900,
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
  if (params.get('line_items[0][price_data][product_data][name]') !== 'VIP Activation') {
    throw new Error('VIP Stripe product name drifted');
  }
  if (params.get('line_items[0][price_data][product_data][description]') !== 'One-time activation fee') {
    throw new Error('VIP Stripe product description drifted');
  }
  const metadataKeys = Array.from(params.keys())
    .filter((key) => key.startsWith('metadata['))
    .sort();
  const expectedKeys = ['metadata[country]', 'metadata[discord]', 'metadata[email]', 'metadata[first_name]', 'metadata[last_name]', 'metadata[phone]'];
  if (metadataKeys.join(',') !== expectedKeys.join(',')) throw new Error('VIP Stripe metadata drifted');
  const raw = params.toString().toLowerCase();
  for (const word of ['platform', 'mt4', 'mt5', 'allocation', 'professional', 'executive', 'institutional', '$1m', '$1.5m']) {
    if (raw.includes(word)) throw new Error(`VIP Stripe charge includes ${word}`);
  }
}

assertVipStripeChargeStaysGeneric();

export async function updateVipCheckoutContact(sessionId: string, customer: VipCustomer) {
  const params = new URLSearchParams();
  params.set('customer_email', customer.email.trim());
  params.set('metadata[email]', customer.email.trim());
  params.set('metadata[phone]', customer.phone.trim());
  params.set('metadata[first_name]', customer.firstName.trim());
  params.set('metadata[last_name]', customer.lastName.trim());
  params.set('metadata[country]', customer.country.trim());
  params.set('metadata[discord]', customer.discordUsername?.trim() || '');
  // Clear allocation details if an older session stored them.
  params.set('metadata[level]', '');
  params.set('metadata[tier]', '');
  params.set('metadata[platform]', '');
  params.set('metadata[source]', '');

  try {
    return await stripeRequest<VipCheckoutSession>(`/checkout/sessions/${sessionId}`, params);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!/email/i.test(message)) throw error;
    params.delete('customer_email');
    return stripeRequest<VipCheckoutSession>(`/checkout/sessions/${sessionId}`, params);
  }
}

export async function retrieveVipCheckoutSession(sessionId: string): Promise<VipCheckoutSession> {
  return stripeRequest<VipCheckoutSession>(
    `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent`,
    undefined,
    'GET'
  );
}

export function isCheckoutSessionId(value: string): boolean {
  return /^cs_(test|live)_[A-Za-z0-9]+$/.test(value);
}

export function paymentIntentIdOf(session: VipCheckoutSession): string {
  if (typeof session.payment_intent === 'string' && session.payment_intent) {
    return session.payment_intent;
  }
  if (session.payment_intent && typeof session.payment_intent === 'object' && session.payment_intent.id) {
    return session.payment_intent.id;
  }
  return session.id;
}
