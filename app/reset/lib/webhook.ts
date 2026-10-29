import { createHmac, timingSafeEqual } from 'crypto';

export function resetWebhookSecret(): string {
  return (process.env.RESET_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '').trim();
}

/** Stripe's signed payload is `${timestamp}.${rawBody}`, HMAC-SHA256, hex v1. */
export function verifyStripeSignature(payload: string, header: string | null, secret: string): boolean {
  if (!header || !secret || secret.length < 10 || payload.length > 1_000_000) return false;
  const parts = header.split(',').map((part) => {
    const index = part.indexOf('=');
    if (index === -1) return null;
    return [part.slice(0, index).trim(), part.slice(index + 1).trim()] as const;
  });
  const timestamp = parts.find((part) => part?.[0] === 't')?.[1];
  const signatures = parts.filter((part) => part?.[0] === 'v1').map((part) => part?.[1] || '');
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false;
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 5 * 60) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${payload}`, 'utf8').digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');
  return signatures.some((signature) => {
    const actual = Buffer.from(signature, 'utf8');
    return actual.length === expectedBuf.length && timingSafeEqual(actual, expectedBuf);
  });
}
