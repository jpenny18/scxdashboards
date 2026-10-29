import { createHash } from 'crypto';
import { db } from '@/lib/firebase-admin';
import { Timestamp, type DocumentData } from 'firebase-admin/firestore';
import { RESET } from '../config';
import { evaluateResetHandoff, isResetReference, type ResetOrder } from '../catalog';
import { isAllowedResetRedirect } from '../urls';
import { sendResetPaymentEmails, type ResetReceipt } from './notify';
import { paymentIntentIdOf, type ResetCheckoutSession } from './stripe-server';

const HANDOFFS = 'resetHandoffs';
const CARD_ORDERS = 'card-orders';

export { handoffAuthorized, handoffSecretConfigured } from '../../checkout/lib/records';

export type ResetHandoff = Omit<ResetOrder, 'idempotencyKey'> & {
  id: string;
  status: 'open' | 'completed';
  stripeSessionId: string | null;
  expiresAt: Date;
  fingerprint: string;
};

export type ResetCardState = 'open' | 'paid' | 'closed' | 'missing';

function fingerprintFor(order: ResetOrder): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        userId: order.userId,
        email: order.email.toLowerCase(),
        firstName: order.firstName,
        lastName: order.lastName,
        phone: order.phone,
        country: order.country,
        discordUsername: order.discordUsername,
        localOrderId: order.localOrderId,
        accountId: order.accountId,
        resetCategory: order.resetCategory,
        accountType: order.accountType,
        accountSize: order.accountSize,
        accountStep: order.accountStep,
        accountStatus: order.accountStatus,
        catalogType: order.catalogType,
        platform: order.platform,
        discountPercent: order.discountPercent,
        amountCents: order.amountCents,
        originalCents: order.originalCents,
        returnUrl: order.returnUrl,
        cancelUrl: order.cancelUrl,
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

function handoffFrom(id: string, data: DocumentData): ResetHandoff | null {
  const status = data.status === 'completed' ? 'completed' : data.status === 'open' ? 'open' : null;
  const amountCents = Number(data.amountCents);
  const originalCents = Number(data.originalCents);
  const expiresAt = asDate(data.expiresAt);
  const returnUrl = String(data.returnUrl || '');
  const cancelUrl = String(data.cancelUrl || '');
  const email = String(data.email || '');
  if (!status || !expiresAt || !email) return null;
  if (!Number.isInteger(amountCents) || amountCents < RESET.minChargeCents) return null;
  if (!Number.isInteger(originalCents) || originalCents < amountCents) return null;
  if (!isAllowedResetRedirect(returnUrl) || !isAllowedResetRedirect(cancelUrl)) return null;
  const discountPercent = Number(data.discountPercent);
  if (discountPercent !== 0 && discountPercent !== 20) return null;

  const accountStep = data.accountStep === null || data.accountStep === undefined ? null : Number(data.accountStep);
  if (accountStep !== null && !Number.isInteger(accountStep)) return null;
  const resetCategory = data.resetCategory;
  const accountType = data.accountType;
  const platform = data.platform;
  const accountSize = Number(data.accountSize);
  if (resetCategory !== 'challenge' && resetCategory !== 'funded' && resetCategory !== 'vip') return null;
  if (
    accountType !== 'standard' &&
    accountType !== '1-step' &&
    accountType !== 'instant' &&
    accountType !== 'gauntlet' &&
    accountType !== 'vip'
  ) {
    return null;
  }
  if (platform !== 'MT4' && platform !== 'MT5') return null;
  if (!Number.isInteger(accountSize) || accountSize <= 0) return null;
  if (!data.localOrderId || !data.accountId || !data.userId || !data.challengeType || !data.challengeAmount) return null;

  return {
    id,
    localOrderId: String(data.localOrderId),
    userId: String(data.userId),
    accountId: String(data.accountId),
    resetCategory,
    accountType,
    accountSize,
    accountStep,
    accountStatus: String(data.accountStatus || ''),
    catalogType: String(data.catalogType || ''),
    challengeType: String(data.challengeType),
    challengeAmount: String(data.challengeAmount),
    resetType: String(data.resetType || ''),
    tierName: data.tierName ? String(data.tierName) : null,
    platform,
    discountPercent,
    originalCents,
    amountCents,
    firstName: String(data.firstName || ''),
    lastName: String(data.lastName || ''),
    email,
    phone: String(data.phone || ''),
    country: String(data.country || ''),
    discordUsername: String(data.discordUsername || ''),
    returnUrl,
    cancelUrl,
    status,
    stripeSessionId: data.stripeSessionId ? String(data.stripeSessionId) : null,
    expiresAt,
    fingerprint: String(data.fingerprint || ''),
  };
}

function dollarsMatchCents(value: unknown, cents: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && Math.round(value * 100) === cents;
}

export function sameResetOrder(data: DocumentData, handoff: Pick<ResetHandoff, 'id' | 'userId' | 'accountId' | 'accountSize' | 'accountType' | 'amountCents' | 'originalCents' | 'resetCategory' | 'platform' | 'catalogType' | 'tierName' | 'challengeType' | 'challengeAmount' | 'discountPercent'>): boolean {
  return (
    data.orderKind === 'account-reset' &&
    data.paymentMethod === 'card' &&
    String(data.idempotencyKey || '').toLowerCase() === handoff.id &&
    String(data.userId || '') === handoff.userId &&
    String(data.accountId || '') === handoff.accountId &&
    Number(data.accountSize) === handoff.accountSize &&
    String(data.sourceAccountType || '') === handoff.accountType &&
    Number(data.expectedAmountCents) === handoff.amountCents &&
    dollarsMatchCents(data.totalAmount, handoff.amountCents) &&
    dollarsMatchCents(data.originalPrice, handoff.originalCents) &&
    String(data.resetCategory || '') === handoff.resetCategory &&
    String(data.platform || '') === handoff.platform &&
    String(data.catalogType || '') === handoff.catalogType &&
    String(data.tierName || '') === (handoff.tierName || '') &&
    String(data.challengeType || '') === handoff.challengeType &&
    String(data.challengeAmount || '') === handoff.challengeAmount &&
    Number(data.discountPercent) === handoff.discountPercent
  );
}

function cardIsPaid(data: DocumentData): boolean {
  return data.paymentStatus === 'completed' && data.status === 'completed';
}

function cardIsClosed(data: DocumentData): boolean {
  return data.status === 'cancelled' || data.paymentStatus === 'cancelled' || data.paymentStatus === 'failed';
}

export async function getResetHandoff(id: string): Promise<ResetHandoff | null> {
  const key = id.trim().toLowerCase();
  if (!isResetReference(key)) return null;
  const snap = await db.collection(HANDOFFS).doc(key).get();
  if (!snap.exists) return null;
  return handoffFrom(key, snap.data() || {});
}

export async function getResetHandoffByStripeSession(sessionId: string): Promise<ResetHandoff | null> {
  const snap = await db.collection(HANDOFFS).where('stripeSessionId', '==', sessionId).limit(1).get();
  if (snap.empty) return null;
  return handoffFrom(snap.docs[0].id, snap.docs[0].data());
}

export async function readResetCard(handoff: ResetHandoff): Promise<ResetCardState> {
  const snap = await db.collection(CARD_ORDERS).doc(handoff.localOrderId).get();
  if (!snap.exists) return 'missing';
  const data = snap.data() || {};
  if (!sameResetOrder(data, handoff)) return 'missing';
  if (cardIsClosed(data)) return 'closed';
  if (cardIsPaid(data)) return 'paid';
  return 'open';
}

export async function openResetHandoff(body: Record<string, unknown>): Promise<
  | { ok: true; handoffId: string; reused: boolean }
  | { ok: false; status: number; error: string }
> {
  const evaluated = evaluateResetHandoff(body);
  if (!evaluated.ok) {
    if (evaluated.error === 'The reset total does not match the price on this portal.') {
      console.error('Reset price mismatch', {
        resetCategory: body.resetCategory,
        accountType: body.accountType,
        accountSize: body.accountSize,
        catalogType: body.catalogType,
        expectedAmountCents: body.expectedAmountCents,
      });
      return { ok: false, status: 409, error: evaluated.error };
    }
    return { ok: false, status: 400, error: evaluated.error };
  }

  const order = evaluated.order;
  const fingerprint = fingerprintFor(order);
  const handoffRef = db.collection(HANDOFFS).doc(order.idempotencyKey);
  const cardRef = db.collection(CARD_ORDERS).doc(order.localOrderId);

  return db.runTransaction(async (tx) => {
    const existingSnap = await tx.get(handoffRef);
    const cardSnap = await tx.get(cardRef);
    if (!cardSnap.exists) return { ok: false as const, status: 409, error: 'Reset order was not found.' };

    const card = cardSnap.data() || {};
    const preview = { ...order, id: order.idempotencyKey };
    if (!sameResetOrder(card, preview)) {
      return { ok: false as const, status: 409, error: 'This reset order does not match the payment request.' };
    }
    if (cardIsClosed(card)) {
      return { ok: false as const, status: 409, error: 'This reset can no longer be paid.' };
    }
    const alreadyPaid = cardIsPaid(card);

    if (existingSnap.exists) {
      const existing = handoffFrom(order.idempotencyKey, existingSnap.data() || {});
      if (!existing || existing.fingerprint !== fingerprint) {
        return { ok: false as const, status: 409, error: 'This checkout attempt was already used for a different order.' };
      }
      if (existing.status === 'open' && existing.expiresAt.getTime() <= Date.now() && !alreadyPaid) {
        tx.update(handoffRef, {
          expiresAt: Timestamp.fromMillis(Date.now() + RESET.handoffTtlMs),
          updatedAt: Timestamp.now(),
        });
      }
      return { ok: true as const, handoffId: existing.id, reused: true };
    }

    const now = Timestamp.now();
    tx.set(handoffRef, {
      orderKind: 'account-reset',
      localOrderId: order.localOrderId,
      userId: order.userId,
      accountId: order.accountId,
      resetCategory: order.resetCategory,
      accountType: order.accountType,
      accountSize: order.accountSize,
      accountStep: order.accountStep,
      accountStatus: order.accountStatus,
      catalogType: order.catalogType,
      challengeType: order.challengeType,
      challengeAmount: order.challengeAmount,
      resetType: order.resetType,
      tierName: order.tierName,
      platform: order.platform,
      discountPercent: order.discountPercent,
      originalCents: order.originalCents,
      amountCents: order.amountCents,
      firstName: order.firstName,
      lastName: order.lastName,
      email: order.email,
      phone: order.phone,
      country: order.country,
      discordUsername: order.discordUsername,
      returnUrl: order.returnUrl,
      cancelUrl: order.cancelUrl,
      fingerprint,
      status: alreadyPaid ? 'completed' : 'open',
      stripeSessionId: null,
      paymentIntentId: null,
      createdAt: now,
      updatedAt: now,
      expiresAt: Timestamp.fromMillis(now.toMillis() + RESET.handoffTtlMs),
    });

    return { ok: true as const, handoffId: order.idempotencyKey, reused: false };
  });
}

export async function claimResetStripeSession(
  handoffId: string,
  sessionId: string,
  replaceSessionId: string | null
): Promise<{ sessionId: string; completed: boolean }> {
  const ref = db.collection(HANDOFFS).doc(handoffId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error('Checkout link not found');
    const data = snap.data() || {};
    if (data.status === 'completed') {
      return { sessionId: data.stripeSessionId ? String(data.stripeSessionId) : '', completed: true };
    }
    const current = data.stripeSessionId ? String(data.stripeSessionId) : '';
    if (current && current !== sessionId && current !== replaceSessionId) {
      return { sessionId: current, completed: false };
    }
    if (current !== sessionId) {
      tx.update(ref, { stripeSessionId: sessionId, updatedAt: Timestamp.now() });
    }
    return { sessionId, completed: false };
  });
}

export async function recordPaidReset(
  handoffId: string,
  session: ResetCheckoutSession
): Promise<{ ok: true; returnUrl: string; alreadyRecorded: boolean } | { ok: false; error: string }> {
  if (session.payment_status !== 'paid' || typeof session.amount_total !== 'number') {
    return { ok: false, error: 'Payment is not complete' };
  }

  const handoffRef = db.collection(HANDOFFS).doc(handoffId);
  const outcome = await db.runTransaction(async (tx) => {
    const handoffSnap = await tx.get(handoffRef);
    if (!handoffSnap.exists) return { ok: false as const, error: 'Checkout record not found' };
    const handoff = handoffFrom(handoffId, handoffSnap.data() || {});
    if (!handoff) return { ok: false as const, error: 'Checkout record not found' };
    if (handoff.stripeSessionId !== session.id) {
      return { ok: false as const, error: 'Payment session does not match this checkout' };
    }
    if (handoff.amountCents !== session.amount_total) {
      return { ok: false as const, error: 'Paid amount does not match this checkout' };
    }

    const cardRef = db.collection(CARD_ORDERS).doc(handoff.localOrderId);
    const cardSnap = await tx.get(cardRef);
    if (!cardSnap.exists) return { ok: false as const, error: 'Reset order was not found.' };
    const card = cardSnap.data() || {};
    if (!sameResetOrder(card, handoff)) {
      return { ok: false as const, error: 'This reset order does not match the payment request.' };
    }
    if (cardIsClosed(card)) return { ok: false as const, error: 'This reset can no longer be paid.' };

    const cardPaid = cardIsPaid(card);
    if (handoff.status === 'completed' && cardPaid) {
      return { ok: true as const, returnUrl: handoff.returnUrl, alreadyRecorded: true, notify: null };
    }

    const now = Timestamp.now();
    const paymentIntentId = paymentIntentIdOf(session);
    if (handoff.status !== 'completed') {
      tx.update(handoffRef, {
        status: 'completed',
        paymentIntentId,
        updatedAt: now,
      });
    }
    if (!cardPaid) {
      // Fulfillment reads this existing card order. Do not create another order
      // and do not open a new trading account.
      tx.update(cardRef, {
        paymentStatus: 'completed',
        status: 'completed',
        paymentIntentId,
        transactionId: session.id,
        paidAt: now,
        updatedAt: now,
      });
    }

    const notify: ResetReceipt = {
      localOrderId: handoff.localOrderId,
      accountId: handoff.accountId,
      resetType: handoff.resetType,
      challengeAmount: handoff.challengeAmount,
      platform: handoff.platform,
      resetCategory: handoff.resetCategory,
      amountCents: handoff.amountCents,
      originalCents: handoff.originalCents,
      discountPercent: handoff.discountPercent,
      firstName: handoff.firstName,
      lastName: handoff.lastName,
      email: handoff.email,
      phone: handoff.phone,
      country: handoff.country,
      discordUsername: handoff.discordUsername,
      paymentIntentId,
      transactionId: session.id,
    };
    return { ok: true as const, returnUrl: handoff.returnUrl, alreadyRecorded: false, notify };
  });

  if (!outcome.ok || outcome.alreadyRecorded || !outcome.notify) {
    return outcome.ok ? { ok: true, returnUrl: outcome.returnUrl, alreadyRecorded: true } : outcome;
  }

  try {
    await sendResetPaymentEmails(outcome.notify);
  } catch (error) {
    console.error('Reset payment email failed:', error instanceof Error ? error.message : error);
  }

  return { ok: true, returnUrl: outcome.returnUrl, alreadyRecorded: false };
}
