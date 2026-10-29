import { NextRequest, NextResponse } from 'next/server';
import { getResetHandoffByStripeSession, recordPaidReset } from '../../lib/records';
import { isCheckoutSessionId, retrieveResetCheckoutSession } from '../../lib/stripe-server';
import { resetWebhookSecret, verifyStripeSignature } from '../../lib/webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAID_EVENTS = new Set(['checkout.session.completed', 'checkout.session.async_payment_succeeded']);

export async function POST(request: NextRequest) {
  const secret = resetWebhookSecret();
  if (!secret) return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 });

  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get('stripe-signature'), secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: { id?: string } } };
  try {
    event = JSON.parse(payload) as { type?: string; data?: { object?: { id?: string } } };
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (!PAID_EVENTS.has(event.type || '')) return NextResponse.json({ received: true });
  const sessionId = event.data?.object?.id || '';
  if (!isCheckoutSessionId(sessionId)) return NextResponse.json({ received: true });

  try {
    const handoff = await getResetHandoffByStripeSession(sessionId);
    if (!handoff) return NextResponse.json({ received: true });

    const session = await retrieveResetCheckoutSession(sessionId);
    if (session.payment_status !== 'paid') return NextResponse.json({ received: true, pending: true });

    const recorded = await recordPaidReset(handoff.id, session);
    if (!recorded.ok) {
      console.error('Reset webhook record failed:', recorded.error);
      return NextResponse.json({ error: 'Unable to record payment' }, { status: 500 });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Reset webhook error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Unable to record payment' }, { status: 500 });
  }
}
