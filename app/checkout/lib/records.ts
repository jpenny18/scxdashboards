import { createHash, timingSafeEqual } from 'crypto';
import { db } from '@/lib/firebase-admin';
import { FieldValue, Timestamp, type DocumentData } from 'firebase-admin/firestore';
import { sendAdminNotificationEmail, sendCustomerReceiptEmail } from '@/lib/email';
import { CHECKOUT } from '../config';
import { priceSelection, type PortalDiscount } from '../catalog';
import { paymentIntentIdOf, type PortalCheckoutSession } from './stripe-server';

const HANDOFFS = 'checkoutHandoffs';
const CARD_ORDERS = 'card-orders';
const ORDERS = 'orders';
const DISCOUNTS = 'discounts';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KEY_PATTERN = /^[A-Za-z0-9_-]{16,80}$/;
const USER_PATTERN = /^[A-Za-z0-9]{6,128}$/;
const CODE_PATTERN = /^[A-Z0-9_-]{1,40}$/;

export type PortalCustomer = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  discordUsername: string;
};

export type PortalHandoff = {
  id: string;
  cardOrderId: string;
  orderId: string | null;
  userId: string;
  challengeType: string;
  challengeAmount: string;
  platform: string;
  addOns: string[];
  discountCode: string | null;
  discountId: string | null;
  originalCents: number;
  amountCents: number;
  totalAmount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  discordUsername: string;
  status: 'open' | 'completed';
  stripeSessionId: string | null;
  expiresAt: Date;
  fingerprint: string;
};

export function handoffAuthorized(header: string | null): boolean {
  const expected = process.env.CHECKOUT_HANDOFF_SECRET || '';
  if (expected.length < 16) return false;
  if (!header?.startsWith('Bearer ')) return false;
  const provided = header.slice('Bearer '.length).trim();
  if (!provided || provided.length > 200) return false;
  const actual = createHash('sha256').update(provided).digest();
  const wanted = createHash('sha256').update(expected).digest();
  return timingSafeEqual(actual, wanted);
}

export function handoffSecretConfigured(): boolean {
  return (process.env.CHECKOUT_HANDOFF_SECRET || '').length >= 16;
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function readCustomer(body: Record<string, unknown>): { ok: true; customer: PortalCustomer } | { ok: false; error: string } {
  const firstName = text(body.firstName, 80);
  const lastName = text(body.lastName, 80);
  const email = text(body.email, 254);
  const phone = text(body.phone, 40);
  const country = text(body.country, 80);
  const discordUsername = text(body.discordUsername, 80);
  const userId = text(body.userId, 128);

  if (!firstName) return { ok: false, error: 'First name is required' };
  if (!lastName) return { ok: false, error: 'Last name is required' };
  if (!email || !EMAIL_PATTERN.test(email)) return { ok: false, error: 'A valid email is required' };
  if (phone.length < 6) return { ok: false, error: 'Phone number is required' };
  if (country.length < 2) return { ok: false, error: 'Country is required' };
  if (!USER_PATTERN.test(userId)) return { ok: false, error: 'Account is required' };

  return {
    ok: true,
    customer: { userId, firstName, lastName, email, phone, country, discordUsername },
  };
}

export function readIdempotencyKey(value: unknown): string | null {
  const key = typeof value === 'string' ? value.trim() : '';
  return KEY_PATTERN.test(key) ? key : null;
}

function fingerprintFor(input: {
  userId: string;
  email: string;
  challengeType: string;
  challengeAmount: string;
  platform: string;
  addOns: string[];
  discountCode: string | null;
  amountCents: number;
}): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        userId: input.userId,
        email: input.email.toLowerCase(),
        challengeType: input.challengeType,
        challengeAmount: input.challengeAmount,
        platform: input.platform,
        addOns: input.addOns,
        discountCode: input.discountCode,
        amountCents: input.amountCents,
      })
    )
    .digest('hex');
}

function asDate(value: unknown): Date | null {
  if (!value || typeof value !== 'object' || !('toDate' in value)) return null;
  const toDate = (value as { toDate?: unknown }).toDate;
  if (typeof toDate !== 'function') return null;
  try {
    const date = (toDate as () => Date).call(value);
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  } catch {
    return null;
  }
}

function handoffFrom(id: string, data: DocumentData): PortalHandoff | null {
  const status = data.status === 'completed' ? 'completed' : data.status === 'open' ? 'open' : null;
  const amountCents = Number(data.amountCents);
  const originalCents = Number(data.originalCents);
  const expiresAt = asDate(data.expiresAt);
  if (!status || !expiresAt || !Number.isInteger(amountCents) || amountCents < CHECKOUT.minChargeCents) return null;
  if (!Number.isInteger(originalCents) || originalCents < amountCents) return null;
  const email = String(data.email || '');
  if (!email) return null;

  return {
    id,
    cardOrderId: String(data.cardOrderId || ''),
    orderId: data.orderId ? String(data.orderId) : null,
    userId: String(data.userId || ''),
    challengeType: String(data.challengeType || ''),
    challengeAmount: String(data.challengeAmount || ''),
    platform: String(data.platform || ''),
    addOns: Array.isArray(data.addOns) ? data.addOns.map((item) => String(item)) : [],
    discountCode: data.discountCode ? String(data.discountCode) : null,
    discountId: data.discountId ? String(data.discountId) : null,
    originalCents,
    amountCents,
    totalAmount: amountCents / 100,
    firstName: String(data.firstName || ''),
    lastName: String(data.lastName || ''),
    email,
    phone: String(data.phone || ''),
    country: String(data.country || ''),
    discordUsername: String(data.discordUsername || ''),
    status,
    stripeSessionId: data.stripeSessionId ? String(data.stripeSessionId) : null,
    expiresAt,
    fingerprint: String(data.fingerprint || ''),
  };
}

export async function getHandoff(id: string): Promise<PortalHandoff | null> {
  if (!KEY_PATTERN.test(id)) return null;
  const snap = await db.collection(HANDOFFS).doc(id).get();
  if (!snap.exists) return null;
  return handoffFrom(id, snap.data() || {});
}

export async function getHandoffByStripeSession(sessionId: string): Promise<PortalHandoff | null> {
  const snap = await db.collection(HANDOFFS).where('stripeSessionId', '==', sessionId).limit(1).get();
  if (snap.empty) return null;
  return handoffFrom(snap.docs[0].id, snap.docs[0].data());
}

async function resolveDiscount(rawCode: unknown): Promise<
  | { ok: true; discount: (PortalDiscount & { id: string; code: string }) | null }
  | { ok: false; error: string }
> {
  const code = text(rawCode, 40).toUpperCase();
  if (!code) return { ok: true, discount: null };
  if (!CODE_PATTERN.test(code)) return { ok: false, error: 'Invalid discount code' };

  const snap = await db.collection(DISCOUNTS).where('code', '==', code).limit(5).get();
  const match = snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .find((record) => (record as { active?: boolean }).active === true) as
    | {
        id: string;
        code?: string;
        type?: string;
        value?: number;
        expiresAt?: { toDate: () => Date } | null;
        usageLimit?: number | null;
        usageCount?: number;
      }
    | undefined;

  if (!match) return { ok: false, error: 'Invalid discount code' };
  if (match.expiresAt && match.expiresAt.toDate() < new Date()) {
    return { ok: false, error: 'This code has expired' };
  }
  if (match.usageLimit !== null && match.usageLimit !== undefined && Number(match.usageCount || 0) >= match.usageLimit) {
    return { ok: false, error: 'This code has reached its usage limit' };
  }
  if (match.type !== 'percentage' && match.type !== 'fixed') return { ok: false, error: 'Invalid discount code' };
  const value = Number(match.value);
  if (!Number.isFinite(value) || value < 0) return { ok: false, error: 'Invalid discount code' };
  if (match.type === 'percentage' && value > 100) return { ok: false, error: 'Invalid discount code' };

  return { ok: true, discount: { id: match.id, code, type: match.type, value } };
}

export async function openHandoff(body: Record<string, unknown>): Promise<
  | {
      ok: true;
      handoffId: string;
      cardOrderId: string;
      amountCents: number;
      originalCents: number;
      reused: boolean;
    }
  | { ok: false; status: number; error: string; portalAmount?: number }
> {
  const idempotencyKey = readIdempotencyKey(body.idempotencyKey);
  if (!idempotencyKey) return { ok: false, status: 400, error: 'Checkout attempt is invalid' };

  const customerResult = readCustomer(body);
  if (!customerResult.ok) return { ok: false, status: 400, error: customerResult.error };

  const discountResult = await resolveDiscount(body.discountCode);
  if (!discountResult.ok) return { ok: false, status: 400, error: discountResult.error };

  const priced = priceSelection(
    {
      challengeType: body.challengeType,
      challengeAmount: body.challengeAmount,
      platform: body.platform,
      addOns: body.addOns,
    },
    discountResult.discount
  );
  if (!priced.ok) return { ok: false, status: 400, error: priced.error };

  if (typeof body.expectedAmount !== 'number' || !Number.isFinite(body.expectedAmount)) {
    return { ok: false, status: 400, error: 'Expected amount is required' };
  }
  const expectedCents = Math.round(body.expectedAmount * 100);
  if (expectedCents !== priced.selection.amountCents) {
    console.error('Checkout price mismatch', {
      expectedCents,
      amountCents: priced.selection.amountCents,
      challengeType: priced.selection.challengeType,
      challengeAmount: priced.selection.challengeAmount,
    });
    return {
      ok: false,
      status: 409,
      error: 'We could not start checkout because the order total changed. Refresh the page and try again.',
      portalAmount: priced.selection.amountCents / 100,
    };
  }

  const selection = priced.selection;
  const customer = customerResult.customer;
  const discount = discountResult.discount;
  const fingerprint = fingerprintFor({
    userId: customer.userId,
    email: customer.email,
    challengeType: selection.challengeType,
    challengeAmount: selection.challengeAmount,
    platform: selection.platform,
    addOns: selection.addOns,
    discountCode: discount?.code || null,
    amountCents: selection.amountCents,
  });

  const handoffRef = db.collection(HANDOFFS).doc(idempotencyKey);
  return db.runTransaction(async (tx) => {
    const existingSnap = await tx.get(handoffRef);
    if (existingSnap.exists) {
      const existing = handoffFrom(idempotencyKey, existingSnap.data() || {});
      if (!existing || existing.fingerprint !== fingerprint) {
        return { ok: false as const, status: 409, error: 'This checkout attempt was already used for a different order.' };
      }
      if (existing.status === 'completed') {
        return { ok: false as const, status: 409, error: 'This payment was already completed.' };
      }
      if (existing.expiresAt.getTime() <= Date.now()) {
        return { ok: false as const, status: 410, error: 'This checkout link has expired. Start the payment again.' };
      }
      return {
        ok: true as const,
        handoffId: existing.id,
        cardOrderId: existing.cardOrderId,
        amountCents: existing.amountCents,
        originalCents: existing.originalCents,
        reused: true,
      };
    }

    const now = Timestamp.now();
    const cardRef = db.collection(CARD_ORDERS).doc();
    const cardOrder = {
      userId: customer.userId,
      customerEmail: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      country: customer.country,
      discordUsername: customer.discordUsername,
      challengeType: selection.challengeType,
      challengeAmount: selection.challengeAmount,
      platform: selection.platform,
      addOns: selection.addOns,
      discountCode: discount?.code || null,
      discountId: discount?.id || null,
      originalAmount: selection.originalCents / 100,
      totalAmount: selection.amountCents / 100,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      status: 'pending',
      handoffId: idempotencyKey,
      checkoutPortal: true,
      createdAt: now,
      updatedAt: now,
    };
    tx.set(cardRef, cardOrder);
    tx.set(handoffRef, {
      ...cardOrder,
      cardOrderId: cardRef.id,
      orderId: null,
      originalCents: selection.originalCents,
      amountCents: selection.amountCents,
      email: customer.email,
      stripeSessionId: null,
      fingerprint,
      status: 'open',
      expiresAt: Timestamp.fromMillis(now.toMillis() + CHECKOUT.handoffTtlMs),
    });

    return {
      ok: true as const,
      handoffId: idempotencyKey,
      cardOrderId: cardRef.id,
      amountCents: selection.amountCents,
      originalCents: selection.originalCents,
      reused: false,
    };
  });
}

export async function claimStripeSession(handoffId: string, sessionId: string): Promise<{ sessionId: string; completed: boolean }> {
  const ref = db.collection(HANDOFFS).doc(handoffId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error('Checkout link not found');
    const data = snap.data() || {};
    if (data.status === 'completed') {
      return { sessionId: data.stripeSessionId ? String(data.stripeSessionId) : '', completed: true };
    }
    const current = data.stripeSessionId ? String(data.stripeSessionId) : '';
    if (current && current !== sessionId) return { sessionId: current, completed: false };
    tx.update(ref, { stripeSessionId: sessionId, updatedAt: Timestamp.now() });
    return { sessionId, completed: false };
  });
}

export async function recordPaidPortalOrder(handoffId: string, session: PortalCheckoutSession): Promise<
  | { ok: true; orderId: string; alreadyRecorded: boolean }
  | { ok: false; error: string }
> {
  if (session.payment_status !== 'paid' || typeof session.amount_total !== 'number') {
    return { ok: false, error: 'Payment is not complete' };
  }

  const handoffRef = db.collection(HANDOFFS).doc(handoffId);
  const outcome = await db.runTransaction(async (tx) => {
    const handoffSnap = await tx.get(handoffRef);
    if (!handoffSnap.exists) return { ok: false as const, error: 'Checkout record not found' };
    const data = handoffSnap.data() || {};
    const handoff = handoffFrom(handoffId, data);
    if (!handoff) return { ok: false as const, error: 'Checkout record not found' };
    if (handoff.stripeSessionId !== session.id) return { ok: false as const, error: 'Payment session does not match this checkout' };
    if (handoff.amountCents !== session.amount_total) return { ok: false as const, error: 'Paid amount does not match this checkout' };
    if (handoff.status === 'completed' && handoff.orderId) {
      return { ok: true as const, orderId: handoff.orderId, alreadyRecorded: true, emailOrder: null };
    }

    const cardRef = handoff.cardOrderId ? db.collection(CARD_ORDERS).doc(handoff.cardOrderId) : null;
    const cardSnap = cardRef ? await tx.get(cardRef) : null;
    const userRef = handoff.userId ? db.collection('users').doc(handoff.userId) : null;
    const userSnap = userRef ? await tx.get(userRef) : null;
    const discountRef = handoff.discountId ? db.collection(DISCOUNTS).doc(handoff.discountId) : null;
    const discountSnap = discountRef ? await tx.get(discountRef) : null;

    const now = Timestamp.now();
    const paymentIntentId = paymentIntentIdOf(session);
    const orderRef = db.collection(ORDERS).doc();
    const order = {
      userId: handoff.userId || null,
      customerEmail: handoff.email,
      firstName: handoff.firstName,
      lastName: handoff.lastName,
      phone: handoff.phone,
      country: handoff.country,
      discordUsername: handoff.discordUsername,
      challengeType: handoff.challengeType,
      challengeAmount: handoff.challengeAmount,
      platform: handoff.platform,
      addOns: handoff.addOns,
      discountCode: handoff.discountCode,
      discountId: handoff.discountId,
      originalAmount: handoff.originalCents / 100,
      totalAmount: handoff.totalAmount,
      paymentMethod: 'card' as const,
      paymentStatus: 'completed' as const,
      paymentIntentId,
      transactionId: session.id,
      handoffId,
      cardOrderId: handoff.cardOrderId || null,
      createdAt: now,
      updatedAt: now,
    };

    tx.set(orderRef, order);
    tx.update(handoffRef, {
      status: 'completed',
      orderId: orderRef.id,
      updatedAt: now,
    });
    if (cardRef && cardSnap?.exists) {
      tx.update(cardRef, {
        paymentStatus: 'completed',
        status: 'completed',
        paymentIntentId,
        transactionId: session.id,
        orderId: orderRef.id,
        updatedAt: now,
      });
    }
    if (userRef && userSnap?.exists) {
      tx.update(userRef, {
        totalSpent: FieldValue.increment(handoff.totalAmount),
        orderCount: FieldValue.increment(1),
        lastOrderDate: now,
        updatedAt: now,
      });
    }
    if (discountRef && discountSnap?.exists) {
      tx.update(discountRef, {
        usageCount: FieldValue.increment(1),
        updatedAt: now,
      });
    }

    return {
      ok: true as const,
      orderId: orderRef.id,
      alreadyRecorded: false,
      emailOrder: {
        ...order,
        id: orderRef.id,
        createdAt: { toDate: () => now.toDate() },
        updatedAt: { toDate: () => now.toDate() },
      },
    };
  });

  if (!outcome.ok || outcome.alreadyRecorded || !outcome.emailOrder) {
    return outcome.ok ? { ok: true, orderId: outcome.orderId, alreadyRecorded: true } : outcome;
  }

  try {
    const emailOrder = outcome.emailOrder as unknown as Parameters<typeof sendAdminNotificationEmail>[0];
    await Promise.all([sendAdminNotificationEmail(emailOrder), sendCustomerReceiptEmail(emailOrder)]);
  } catch (error) {
    console.error('Checkout order email failed:', error instanceof Error ? error.message : error);
  }

  return { ok: true, orderId: outcome.orderId, alreadyRecorded: false };
}
