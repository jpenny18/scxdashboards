import { NextRequest, NextResponse } from 'next/server';
import { getResetHandoffByStripeSession, recordPaidReset } from '../../lib/records';
import { isCheckoutSessionId, retrieveResetCheckoutSession } from '../../lib/stripe-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = String(body?.sessionId || '');
    if (!isCheckoutSessionId(sessionId)) {
      return NextResponse.json({ error: 'Invalid checkout session' }, { status: 400 });
    }

    const session = await retrieveResetCheckoutSession(sessionId);
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        {
          paid: false,
          status: session.status || 'open',
          paymentStatus: session.payment_status || 'unpaid',
        },
        { status: 409 }
      );
    }

    const handoff = await getResetHandoffByStripeSession(sessionId);
    if (!handoff) return NextResponse.json({ error: 'Checkout record not found' }, { status: 404 });

    const recorded = await recordPaidReset(handoff.id, session);
    if (!recorded.ok) {
      console.error('Reset record failed:', recorded.error);
      return NextResponse.json({ error: recorded.error }, { status: 500 });
    }
    return NextResponse.json({ paid: true, alreadyRecorded: recorded.alreadyRecorded });
  } catch (error) {
    console.error('Reset complete error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to confirm payment' },
      { status: 500 }
    );
  }
}
