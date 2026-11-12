import { NextRequest, NextResponse } from 'next/server';
import { handoffAuthorized, handoffSecretConfigured } from '../../../checkout/lib/records';
import { portalBaseUrl } from '../../../checkout/lib/stripe-server';
import { openVipHandoff } from '../../lib/handoff';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!handoffSecretConfigured()) {
      return NextResponse.json({ error: 'Checkout is not configured' }, { status: 503 });
    }
    if (!handoffAuthorized(request.headers.get('authorization'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const opened = await openVipHandoff(body as Record<string, unknown>);
    if (!opened.ok) {
      return NextResponse.json({ error: opened.error }, { status: opened.status });
    }

    const checkoutUrl = `${portalBaseUrl(request)}/vip?ref=${encodeURIComponent(opened.handoffId)}`;
    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('VIP handoff error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 500 });
  }
}
