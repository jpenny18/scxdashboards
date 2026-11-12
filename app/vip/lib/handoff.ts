import { createHash } from 'crypto';
import { db } from '@/lib/firebase-admin';
import { Timestamp, type DocumentData } from 'firebase-admin/firestore';
const DISCOUNTS = 'discounts';
const CODE_PATTERN = /^[A-Z0-9_-]{1,40}$/;

const HANDOFFS = 'vipHandoffs';
const TTL_MS = 24 * 60 * 60 * 1000;
const KEY_PATTERN = /^[A-Za-z0-9_-]{16,80}$/;
const USER_PATTERN = /^[A-Za-z0-9]{6,128}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOCATIONS = [
  { level: '$1M', tier: 'Professional', listCents: 549900 },
  { level: '$2M', tier: 'Executive', listCents: 999900 },
  { level: '$3M', tier: 'Institutional', listCents: 1499900 },
] as const;

export type VipAllocationLevel = (typeof ALLOCATIONS)[number]['level'];

export type VipPortalHandoff = {
  id: string;
  userId: string;
  level: VipAllocationLevel;
  tier: string;
  platform: 'MT4' | 'MT5';
  originalCents: number;
  amountCents: number;
  discountCode: string | null;
  discountId: string | null;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number | null;
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

type PortalDiscount = { type: 'percentage' | 'fixed'; value: number } | null;

function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function centsOf(amount: number): number {
  return Math.round(roundToCents(amount) * 100);
}

export function priceVipHandoff(level: string, discount: PortalDiscount):
  | { ok: true; level: VipAllocationLevel; tier: string; originalCents: number; amountCents: number }
  | { ok: false; error: string } {
  const allocation = ALLOCATIONS.find((item) => item.level === level.trim());
  if (!allocation) return { ok: false, error: 'Choose a valid allocation' };
  const listDollars = allocation.listCents / 100;
  let charge = listDollars;
  if (discount?.type === 'percentage') {
    charge = roundToCents(listDollars * (1 - discount.value / 100));
  } else if (discount?.type === 'fixed') {
    charge = roundToCents(Math.max(0, listDollars - discount.value));
  }
  const amountCents = centsOf(charge);
  if (amountCents < 50) return { ok: false, error: 'This order total cannot be charged by card' };
  return {
    ok: true,
    level: allocation.level,
    tier: allocation.tier,
    originalCents: allocation.listCents,
    amountCents,
  };
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function fingerprintFor(input: {
  userId: string;
  email: string;
  level: string;
  platform: string;
  discountCode: string | null;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number | null;
  amountCents: number;
}): string {
  return createHash('sha256')
    .update(JSON.stringify({
      userId: input.userId,
      email: input.email.toLowerCase(),
      level: input.level,
      platform: input.platform,
      discountCode: input.discountCode,
      discountType: input.discountType,
      discountValue: input.discountValue,
      amountCents: input.amountCents,
    }))
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

function handoffFrom(id: string, data: DocumentData): VipPortalHandoff | null {
  const discountType = data.discountType === 'percentage' || data.discountType === 'fixed' ? data.discountType : null;
  const discountValue = discountType ? Number(data.discountValue) : null;
  const priced = priceVipHandoff(
    String(data.level || ''),
    discountType && discountValue !== null && Number.isFinite(discountValue) ? { type: discountType, value: discountValue } : null
  );
  const amountCents = Number(data.amountCents);
  const originalCents = Number(data.originalCents);
  const expiresAt = asDate(data.expiresAt);
  const email = String(data.email || '');
  const platform = data.platform === 'MT4' ? 'MT4' : data.platform === 'MT5' ? 'MT5' : null;
  const status = data.status === 'completed' ? 'completed' : data.status === 'open' ? 'open' : null;
  if (!priced.ok || !status || !expiresAt || !email || !platform) return null;
  if (priced.amountCents !== amountCents || priced.originalCents !== originalCents) return null;
  return {
    id,
    userId: String(data.userId || ''),
    level: priced.level,
    tier: priced.tier,
    platform,
    originalCents,
    amountCents,
    discountCode: data.discountCode ? String(data.discountCode) : null,
    discountId: data.discountId ? String(data.discountId) : null,
    discountType,
    discountValue: discountValue !== null && Number.isFinite(discountValue) ? discountValue : null,
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

export function isVipHandoffReference(value: string): boolean {
  return KEY_PATTERN.test(value);
}

export async function getVipHandoff(id: string): Promise<VipPortalHandoff | null> {
  const key = id.trim();
  if (!isVipHandoffReference(key)) return null;
  const snap = await db.collection(HANDOFFS).doc(key).get();
  if (!snap.exists) return null;
  return handoffFrom(key, snap.data() || {});
}

export async function openVipHandoff(body: Record<string, unknown>): Promise<
  | { ok: true; handoffId: string; reused: boolean }
  | { ok: false; status: number; error: string }
> {
  const idempotencyKey = text(body.idempotencyKey, 80);
  if (!KEY_PATTERN.test(idempotencyKey)) return { ok: false, status: 400, error: 'Checkout attempt is invalid' };

  const userId = text(body.userId, 128);
  const firstName = text(body.firstName, 80);
  const lastName = text(body.lastName, 80);
  const email = text(body.email, 254);
  const phone = text(body.phone, 40);
  const country = text(body.country, 80);
  const discordUsername = text(body.discordUsername, 80);
  if (!USER_PATTERN.test(userId)) return { ok: false, status: 400, error: 'Account is required' };
  if (!firstName || !lastName) return { ok: false, status: 400, error: 'Name is required' };
  if (!email || !EMAIL_PATTERN.test(email)) return { ok: false, status: 400, error: 'A valid email is required' };
  if (phone.replace(/\D/g, '').length < 7) return { ok: false, status: 400, error: 'Phone number is required' };
  if (country.length < 2) return { ok: false, status: 400, error: 'Country is required' };

  if (body.orderKind !== 'vip-allocation') return { ok: false, status: 400, error: 'This payment link is not a VIP allocation' };
  if (text(body.challengeType, 40) !== 'VIP Activation') return { ok: false, status: 400, error: 'Choose a valid allocation' };

  const level = text(body.challengeAmount, 16);
  const tierName = text(body.tierName, 40);
  const platformRaw = text(body.platform, 8).toUpperCase();
  if (platformRaw !== 'MT4' && platformRaw !== 'MT5') {
    return { ok: false, status: 400, error: 'Platform selection is required' };
  }

  const discount = await resolvePortalDiscount(body);
  if (!discount.ok) return discount;

  const priced = priceVipHandoff(level, discount.discount);
  if (!priced.ok) return { ok: false, status: 400, error: priced.error };
  if (tierName !== priced.tier) return { ok: false, status: 400, error: 'Choose a valid allocation' };
  if (typeof body.originalPrice !== 'number' || Math.round(body.originalPrice * 100) !== priced.originalCents) {
    return { ok: false, status: 409, error: 'The order total does not match this portal.' };
  }
  if (typeof body.expectedAmountCents !== 'number' || !Number.isInteger(body.expectedAmountCents)) {
    return { ok: false, status: 400, error: 'Expected amount is required' };
  }
  if (body.expectedAmountCents !== priced.amountCents) {
    console.error('VIP price mismatch', { level: priced.level, amountCents: priced.amountCents });
    return { ok: false, status: 409, error: 'The order total does not match this portal.' };
  }

  const fingerprint = fingerprintFor({
    userId,
    email,
    level: priced.level,
    platform: platformRaw,
    discountCode: discount.stored?.code || null,
    discountType: discount.stored?.type || null,
    discountValue: discount.stored?.value ?? null,
    amountCents: priced.amountCents,
  });

  const ref = db.collection(HANDOFFS).doc(idempotencyKey);
  return db.runTransaction(async (tx) => {
    const existingSnap = await tx.get(ref);
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
      return { ok: true as const, handoffId: existing.id, reused: true };
    }

    const now = Timestamp.now();
    tx.set(ref, {
      userId,
      level: priced.level,
      tier: priced.tier,
      platform: platformRaw,
      originalCents: priced.originalCents,
      amountCents: priced.amountCents,
      discountCode: discount.stored?.code || null,
      discountId: discount.stored?.id || null,
      discountType: discount.stored?.type || null,
      discountValue: discount.stored?.value ?? null,
      firstName,
      lastName,
      email,
      phone,
      country,
      discordUsername,
      status: 'open',
      stripeSessionId: null,
      fingerprint,
      createdAt: now,
      updatedAt: now,
      expiresAt: Timestamp.fromMillis(now.toMillis() + TTL_MS),
    });
    return { ok: true as const, handoffId: idempotencyKey, reused: false };
  });
}

export async function claimVipStripeSession(
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

export async function completeVipHandoffBySession(sessionId: string): Promise<void> {
  const snap = await db.collection(HANDOFFS).where('stripeSessionId', '==', sessionId).limit(1).get();
  if (snap.empty) return;
  await completeVipHandoff(snap.docs[0].id);
}

export async function completeVipHandoff(handoffId: string): Promise<void> {
  const ref = db.collection(HANDOFFS).doc(handoffId);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.data()?.status === 'completed') return;
    tx.update(ref, { status: 'completed', updatedAt: Timestamp.now() });
  });
}

async function resolvePortalDiscount(body: Record<string, unknown>): Promise<
  | { ok: true; discount: PortalDiscount; stored: { id: string; code: string; type: 'percentage' | 'fixed'; value: number } | null }
  | { ok: false; status: number; error: string }
> {
  const code = text(body.discountCode, 40).toUpperCase();
  if (!code) {
    if (body.discountId || body.discountType || (body.discountValue !== null && body.discountValue !== undefined && body.discountValue !== '')) {
      return { ok: false, status: 400, error: 'Invalid discount code' };
    }
    return { ok: true, discount: null, stored: null };
  }
  if (!CODE_PATTERN.test(code)) return { ok: false, status: 400, error: 'Invalid discount code' };

  const snap = await db.collection(DISCOUNTS).where('code', '==', code).limit(5).get();
  const match = snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .find((record) => (record as { active?: boolean }).active === true) as
    | {
        id: string;
        type?: string;
        value?: number;
        expiresAt?: { toDate: () => Date } | null;
        usageLimit?: number | null;
        usageCount?: number;
      }
    | undefined;
  if (!match) return { ok: false, status: 400, error: 'Invalid discount code' };
  if (match.expiresAt && match.expiresAt.toDate() < new Date()) return { ok: false, status: 400, error: 'This code has expired' };
  if (match.usageLimit !== null && match.usageLimit !== undefined && Number(match.usageCount || 0) >= match.usageLimit) {
    return { ok: false, status: 400, error: 'This code has reached its usage limit' };
  }
  if (match.type !== 'percentage' && match.type !== 'fixed') return { ok: false, status: 400, error: 'Invalid discount code' };
  const value = Number(match.value);
  if (!Number.isFinite(value) || value < 0 || (match.type === 'percentage' && value > 100)) {
    return { ok: false, status: 400, error: 'Invalid discount code' };
  }
  const sentId = text(body.discountId, 128);
  if (sentId && sentId !== match.id) return { ok: false, status: 409, error: 'The order total does not match this portal.' };
  if (body.discountType && body.discountType !== match.type) {
    return { ok: false, status: 409, error: 'The order total does not match this portal.' };
  }
  if (body.discountValue !== null && body.discountValue !== undefined && body.discountValue !== '' && Number(body.discountValue) !== value) {
    return { ok: false, status: 409, error: 'The order total does not match this portal.' };
  }
  return { ok: true, discount: { type: match.type, value }, stored: { id: match.id, code, type: match.type, value } };
}

function assertVipHandoffPrices() {
  const full = priceVipHandoff('$1M', null);
  const ten = priceVipHandoff('$1M', { type: 'percentage', value: 10 });
  const executive = priceVipHandoff('$2M', null);
  const institutional = priceVipHandoff('$3M', { type: 'fixed', value: 1000 });
  if (!full.ok || full.amountCents !== 549900 || full.tier !== 'Professional') throw new Error('VIP $1M price drifted');
  if (!ten.ok || ten.amountCents !== 494910) throw new Error('VIP 10% discount drifted');
  if (!executive.ok || executive.amountCents !== 999900 || executive.tier !== 'Executive') throw new Error('VIP $2M price drifted');
  if (!institutional.ok || institutional.amountCents !== 1399900 || institutional.tier !== 'Institutional') {
    throw new Error('VIP fixed discount drifted');
  }
  if (priceVipHandoff('$1.5M', null).ok) throw new Error('VIP handoff accepted a reset size');
}

assertVipHandoffPrices();
