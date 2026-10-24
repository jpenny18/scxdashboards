import { CHECKOUT } from '../config';
import {
  requestOrigin,
  stripeRequest,
  type VipCheckoutSession,
} from '../../vip/lib/stripe-server';

export type PortalCheckoutSession = VipCheckoutSession;

export { isCheckoutSessionId, paymentIntentIdOf, requestOrigin } from '../../vip/lib/stripe-server';

export function portalBaseUrl(request: Request): string {
  const configured = process.env.CHECKOUT_PUBLIC_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  return requestOrigin(request);
}

export type PortalContact = {
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

function sessionParams(amountCents: number, origin: string, customer: PortalContact, includeCustomerEmail: boolean) {
  const params = new URLSearchParams();
  params.set('ui_mode', 'elements');
  params.set('mode', 'payment');
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', CHECKOUT.currency);
  params.set('line_items[0][price_data][unit_amount]', String(amountCents));
  params.set('line_items[0][price_data][product_data][name]', CHECKOUT.stripeProductName);
  params.set('line_items[0][price_data][product_data][description]', CHECKOUT.stripeProductDescription);
  params.set('return_url', `${origin}${CHECKOUT.returnPath}?session_id={CHECKOUT_SESSION_ID}`);
  params.set('billing_address_collection', 'auto');
  params.set('integration_identifier', CHECKOUT.integrationId);
  if (includeCustomerEmail) params.set('customer_email', customer.email.trim());
  params.set('metadata[email]', meta(customer.email));
  params.set('metadata[phone]', meta(customer.phone));
  params.set('metadata[first_name]', meta(customer.firstName));
  params.set('metadata[last_name]', meta(customer.lastName));
  params.set('metadata[country]', meta(customer.country));
  params.set('metadata[discord]', meta(customer.discordUsername));
  return params;
}

export async function createPortalCheckoutSession(
  amountCents: number,
  origin: string,
  customer: PortalContact
): Promise<PortalCheckoutSession> {
  try {
    return await stripeRequest<PortalCheckoutSession>('/checkout/sessions', sessionParams(amountCents, origin, customer, true));
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!/email/i.test(message)) throw error;
    return stripeRequest<PortalCheckoutSession>('/checkout/sessions', sessionParams(amountCents, origin, customer, false));
  }
}

export async function retrievePortalCheckoutSession(sessionId: string): Promise<PortalCheckoutSession> {
  return stripeRequest<PortalCheckoutSession>(
    `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent`,
    undefined,
    'GET'
  );
}
