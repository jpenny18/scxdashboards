import { NextRequest, NextResponse } from 'next/server';
import {
  claimStripeSession,
  getHandoff,
  getHandoffByStripeSession,
  recordPaidPortalOrder,
  type PortalHandoff,
} from '../../lib/records';
import {
  createPortalCheckoutSession,
  isCheckoutSessionId,
  portalBaseUrl,
  retrievePortalCheckoutSession,
  type PortalCheckoutSession,
} from '../../lib/stripe-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function ready(handoff: PortalHandoff, session: PortalCheckoutSession) {
  return NextResponse.json({
    clientSecret: session.client_secret,
    sessionId: session.id,
    amountCents: handoff.amountCents,
    originalCents: handoff.originalCents,
    email: handoff.email,
    firstName: handoff.firstName,
    lastName: handoff.lastName,
  });
}

function paid(sessionId: string | null) {
  return NextResponse.json({ paid: true, sessionId });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ref = typeof body?.ref === 'string' ? body.ref : '';
    const handoff = await getHandoff(ref);
    if (!handoff) return NextResponse.json({ error: 'This payment link is invalid.' }, { status: 404 });
    if (handoff.status === 'completed') return paid(handoff.stripeSessionId);

    const expired = handoff.expiresAt.getTime() <= Date.now();

    if (handoff.stripeSessionId) {
      const existing = await retrievePortalCheckoutSession(handoff.stripeSessionId);
      if (existing.payment_status === 'paid') {
        const recorded = await recordPaidPortalOrder(handoff.id, existing);
        if (!recorded.ok) console.error('Checkout record failed:', recorded.error);
        return paid(existing.id);
      }
      if (!expired && existing.status === 'open' && existing.client_secret) {
        return ready(handoff, existing);
      }
    }

    if (expired) {
      return NextResponse.json(
        { error: 'This checkout link has expired. Start the payment again.' },
        { status: 410 }
      );
    }

    const created = await createPortalCheckoutSession(handoff.amountCents, portalBaseUrl(request), handoff);
    if (!created.id || !created.client_secret) {
      return NextResponse.json({ error: 'Unable to start checkout' }, { status: 502 });
    }

    const claimed = await claimStripeSession(handoff.id, created.id);
    if (claimed.completed) return paid(claimed.sessionId || created.id);
    if (claimed.sessionId !== created.id) {
      const winner = await retrievePortalCheckoutSession(claimed.sessionId);
      if (winner.payment_status === 'paid') {
        const recorded = await recordPaidPortalOrder(handoff.id, winner);
        if (!recorded.ok) console.error('Checkout record failed:', recorded.error);
        return paid(winner.id);
      }
      if (!winner.client_secret) return NextResponse.json({ error: 'Unable to start checkout' }, { status: 502 });
      return ready(handoff, winner);
    }

    return ready(handoff, created);
  } catch (error) {
    console.error('Checkout session error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to start checkout' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id') || '';
    if (!isCheckoutSessionId(sessionId)) {
      return NextResponse.json({ error: 'Invalid checkout session' }, { status: 400 });
    }

    const handoff = await getHandoffByStripeSession(sessionId);
    if (!handoff) return NextResponse.json({ error: 'Checkout record not found' }, { status: 404 });

    const session = await retrievePortalCheckoutSession(sessionId);
    return NextResponse.json({
      sessionId: session.id,
      status: session.status || 'open',
      paymentStatus: session.payment_status || 'unpaid',
      amountCents: handoff.amountCents,
      email: handoff.email,
    });
  } catch (error) {
    console.error('Checkout session lookup error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load checkout session' },
      { status: 500 }
    );
  }
}
