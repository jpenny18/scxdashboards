import { NextRequest, NextResponse } from 'next/server';
import { getHandoffByStripeSession, recordPaidPortalOrder } from '../../lib/records';
import { isCheckoutSessionId, retrievePortalCheckoutSession } from '../../lib/stripe-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = String(body?.sessionId || '');
    if (!isCheckoutSessionId(sessionId)) {
      return NextResponse.json({ error: 'Invalid checkout session' }, { status: 400 });
    }

    const session = await retrievePortalCheckoutSession(sessionId);
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

    const handoff = await getHandoffByStripeSession(sessionId);
    if (!handoff) return NextResponse.json({ error: 'Checkout record not found' }, { status: 404 });

    const recorded = await recordPaidPortalOrder(handoff.id, session);
    if (!recorded.ok) {
      console.error('Checkout record failed:', recorded.error);
      return NextResponse.json({
        paid: true,
        orderId: null,
        warning: 'Payment received. Order notification is still processing.',
      });
    }
    return NextResponse.json({ paid: true, orderId: recorded.orderId, alreadyRecorded: recorded.alreadyRecorded });
  } catch (error) {
    console.error('Checkout complete error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to confirm payment' },
      { status: 500 }
    );
  }
}
