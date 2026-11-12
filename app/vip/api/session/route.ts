import { NextRequest, NextResponse } from 'next/server';
import { portalBaseUrl } from '../../../checkout/lib/stripe-server';
import { claimVipStripeSession, getVipHandoff, type VipPortalHandoff } from '../../lib/handoff';
import { getCheckoutDraft, resolveCheckoutDraft, saveCheckoutDraft } from '../../lib/records';
import {
  createVipPortalCheckoutSession,
  hideStripeLink,
  isCheckoutSessionId,
  retrieveVipCheckoutSession,
} from '../../lib/stripe-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function ready(handoff: VipPortalHandoff, session: { id: string; client_secret?: string | null }) {
  return NextResponse.json({
    clientSecret: session.client_secret,
    sessionId: session.id,
    amountCents: handoff.amountCents,
    originalCents: handoff.originalCents,
    email: handoff.email,
    firstName: handoff.firstName,
    lastName: handoff.lastName,
    level: handoff.level,
  });
}

function paid(sessionId: string | null) {
  return NextResponse.json({ paid: true, sessionId });
}

async function rememberDraft(handoff: VipPortalHandoff, sessionId: string) {
  const existing = await getCheckoutDraft(sessionId);
  if (existing) return;
  await saveCheckoutDraft({
    sessionId,
    level: handoff.level,
    tier: handoff.tier,
    platform: handoff.platform,
    amountCents: handoff.amountCents,
    originalPrice: handoff.originalCents / 100,
    chargedPrice: handoff.amountCents / 100,
    resetCode: null,
    resetCodeId: null,
    userId: handoff.userId,
    discountCode: handoff.discountCode,
    discountId: handoff.discountId,
    firstName: handoff.firstName,
    lastName: handoff.lastName,
    email: handoff.email,
    phone: handoff.phone,
    country: handoff.country,
    discordUsername: handoff.discordUsername,
    status: 'open',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ref = typeof body?.ref === 'string' ? body.ref : '';
    const handoff = await getVipHandoff(ref);
    if (!handoff) return NextResponse.json({ error: 'This payment link is invalid.' }, { status: 404 });
    if (handoff.status === 'completed') return paid(handoff.stripeSessionId);

    const expired = handoff.expiresAt.getTime() <= Date.now();
    let replaceSessionId: string | null = null;

    if (handoff.stripeSessionId) {
      const existing = await retrieveVipCheckoutSession(handoff.stripeSessionId);
      if (existing.payment_status === 'paid') {
        await rememberDraft(handoff, existing.id);
        return paid(existing.id);
      }
      if (!expired && existing.status === 'open' && existing.client_secret) {
        await rememberDraft(handoff, existing.id);
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

    const created = await createVipPortalCheckoutSession(handoff.amountCents, portalBaseUrl(request), {
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

    const claimed = await claimVipStripeSession(handoff.id, created.id, replaceSessionId);
    if (claimed.completed) return paid(claimed.sessionId || created.id);
    const sessionId = claimed.sessionId || created.id;
    const session = sessionId === created.id ? created : await retrieveVipCheckoutSession(sessionId);
    if (!session.client_secret) return NextResponse.json({ error: 'Unable to start checkout' }, { status: 502 });
    await rememberDraft(handoff, session.id);
    if (session.id !== created.id) await hideStripeLink(session.id);
    return ready(handoff, session);
  } catch (error) {
    console.error('VIP session error:', error instanceof Error ? error.message : error);
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

    const session = await retrieveVipCheckoutSession(sessionId);
    const draft = await resolveCheckoutDraft(session);
    if (!draft) {
      return NextResponse.json({ error: 'Checkout record not found' }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: session.id,
      status: session.status || 'open',
      paymentStatus: session.payment_status || 'unpaid',
      amount: draft.chargedPrice,
      level: draft.level,
      tier: draft.tier,
      platform: draft.platform,
      email: draft.email || session.customer_details?.email || session.customer_email || '',
    });
  } catch (error) {
    console.error('VIP session lookup error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load checkout session' },
      { status: 500 }
    );
  }
}
