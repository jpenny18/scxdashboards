import { NextRequest, NextResponse } from 'next/server';
import { portalBaseUrl } from '../../../checkout/lib/stripe-server';
import {
  claimResetStripeSession,
  getResetHandoff,
  getResetHandoffByStripeSession,
  readResetCard,
  recordPaidReset,
  type ResetHandoff,
} from '../../lib/records';
import {
  createResetCheckoutSession,
  hideStripeLink,
  isCheckoutSessionId,
  retrieveResetCheckoutSession,
  type ResetCheckoutSession,
} from '../../lib/stripe-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function ready(handoff: ResetHandoff, session: ResetCheckoutSession) {
  return NextResponse.json({
    clientSecret: session.client_secret,
    sessionId: session.id,
    amountCents: handoff.amountCents,
    originalCents: handoff.originalCents,
    discountPercent: handoff.discountPercent,
    email: handoff.email,
    firstName: handoff.firstName,
    lastName: handoff.lastName,
    phone: handoff.phone,
    country: handoff.country,
    sizeLabel: handoff.challengeAmount,
    resetType: handoff.resetType,
    platform: handoff.platform,
  });
}

function paid(sessionId: string | null) {
  return NextResponse.json({ paid: true, sessionId });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ref = typeof body?.ref === 'string' ? body.ref : '';
    const handoff = await getResetHandoff(ref);
    if (!handoff) return NextResponse.json({ error: 'This payment link is invalid.' }, { status: 404 });
    if (handoff.status === 'completed') return paid(handoff.stripeSessionId);

    const cardState = await readResetCard(handoff);
    if (cardState === 'paid') return paid(handoff.stripeSessionId);
    if (cardState !== 'open') {
      return NextResponse.json(
        { error: 'This reset can no longer be paid.' },
        { status: 409 }
      );
    }

    const expired = handoff.expiresAt.getTime() <= Date.now();
    let replaceSessionId: string | null = null;

    if (handoff.stripeSessionId) {
      const existing = await retrieveResetCheckoutSession(handoff.stripeSessionId);
      if (existing.payment_status === 'paid') {
        const recorded = await recordPaidReset(handoff.id, existing);
        if (!recorded.ok) {
          console.error('Reset record failed:', recorded.error);
          return NextResponse.json({ error: recorded.error }, { status: 500 });
        }
        return paid(existing.id);
      }
      if (existing.status === 'complete') {
        return NextResponse.json(
          { error: 'This payment is still processing.' },
          { status: 409 }
        );
      }
      if (!expired && existing.status === 'open' && existing.client_secret) {
        await hideStripeLink(existing.id);
        return ready(handoff, existing);
      }
      replaceSessionId = handoff.stripeSessionId;
    }

    if (expired) {
      return NextResponse.json(
        { error: 'This checkout link has expired. Start the payment again.' },
        { status: 410 }
      );
    }

    const created = await createResetCheckoutSession(handoff.amountCents, portalBaseUrl(request), {
      email: handoff.email,
      phone: handoff.phone,
      firstName: handoff.firstName,
      lastName: handoff.lastName,
      country: handoff.country,
      discordUsername: handoff.discordUsername,
    });
    if (!created.id || !created.client_secret) {
      return NextResponse.json({ error: 'Unable to start checkout' }, { status: 502 });
    }

    const claimed = await claimResetStripeSession(handoff.id, created.id, replaceSessionId);
    if (claimed.completed) {
      if (claimed.sessionId && isCheckoutSessionId(claimed.sessionId)) {
        const winner = await retrieveResetCheckoutSession(claimed.sessionId);
        if (winner.payment_status === 'paid') {
          const recorded = await recordPaidReset(handoff.id, winner);
          if (!recorded.ok) {
            console.error('Reset record failed:', recorded.error);
            return NextResponse.json({ error: recorded.error }, { status: 500 });
          }
          return paid(winner.id);
        }
      }
      return paid(claimed.sessionId || handoff.stripeSessionId);
    }

    if (claimed.sessionId !== created.id) {
      const winner = await retrieveResetCheckoutSession(claimed.sessionId);
      if (winner.payment_status === 'paid') {
        const recorded = await recordPaidReset(handoff.id, winner);
        if (!recorded.ok) {
          console.error('Reset record failed:', recorded.error);
          return NextResponse.json({ error: recorded.error }, { status: 500 });
        }
        return paid(winner.id);
      }
      if (!winner.client_secret) return NextResponse.json({ error: 'Unable to start checkout' }, { status: 502 });
      await hideStripeLink(winner.id);
      return ready(handoff, winner);
    }

    return ready(handoff, created);
  } catch (error) {
    console.error('Reset session error:', error instanceof Error ? error.message : error);
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

    const handoff = await getResetHandoffByStripeSession(sessionId);
    if (!handoff) return NextResponse.json({ error: 'Checkout record not found' }, { status: 404 });

    const session = await retrieveResetCheckoutSession(sessionId);
    return NextResponse.json({
      sessionId: session.id,
      status: session.status || 'open',
      paymentStatus: session.payment_status || 'unpaid',
      amountCents: handoff.amountCents,
    });
  } catch (error) {
    console.error('Reset session lookup error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load checkout session' },
      { status: 500 }
    );
  }
}
