'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import VipCardPayment, { type VipCardHandle } from '../vip/components/VipCardPayment';
import { formatUsdFromCents } from './config';
import { isAllowedResetRedirect } from './urls';

type Phase = 'loading' | 'ready' | 'leaving' | 'paid' | 'error';

type ReadyCheckout = {
  clientSecret: string;
  sessionId: string;
  amountCents: number;
  originalCents: number;
  discountPercent: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  sizeLabel: string;
  resetType: string;
  platform: string;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right text-white">{value}</dd>
    </div>
  );
}

export default function ResetClient({ publishableKey }: { publishableKey: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const ref = params.get('ref') || '';
  const cardRef = useRef<VipCardHandle>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [message, setMessage] = useState('');
  const [checkout, setCheckout] = useState<ReadyCheckout | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!ref) {
      setPhase('error');
      setMessage('This payment link is missing. Go back to the page where you started your order.');
      return;
    }

    let cancelled = false;
    setPhase('loading');
    setPaymentError(null);

    const leave = (url: string) => {
      if (!isAllowedResetRedirect(url)) return false;
      setPhase('leaving');
      window.location.replace(url);
      return true;
    };

    const load = async () => {
      const response = await fetch('/reset/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref }),
      });
      const data = await response.json();
      if (cancelled) return;
      if (data.paid) {
        if (typeof data.returnUrl === 'string' && leave(data.returnUrl)) return;
        setPhase('paid');
        return;
      }
      if (!response.ok) {
        setPhase('error');
        setMessage(data.error || 'Unable to open this checkout.');
        return;
      }
      setCheckout({
        clientSecret: String(data.clientSecret),
        sessionId: String(data.sessionId),
        amountCents: Number(data.amountCents),
        originalCents: Number(data.originalCents),
        discountPercent: Number(data.discountPercent),
        email: String(data.email || ''),
        firstName: String(data.firstName || ''),
        lastName: String(data.lastName || ''),
        phone: String(data.phone || ''),
        country: String(data.country || ''),
        sizeLabel: String(data.sizeLabel || ''),
        resetType: String(data.resetType || ''),
        platform: String(data.platform || ''),
      });
      setPhase('ready');
    };

    load().catch(() => {
      if (cancelled) return;
      setPhase('error');
      setMessage('Unable to open this checkout.');
    });

    return () => {
      cancelled = true;
    };
  }, [ref, attempt]);

  const pay = async () => {
    if (!checkout || isPaying) return;
    setIsPaying(true);
    setPaymentError(null);
    try {
      const result = await cardRef.current?.confirm({
        firstName: checkout.firstName,
        lastName: checkout.lastName,
        email: checkout.email,
      });
      if (!result) throw new Error('Card checkout is still loading.');
      if (result.type === 'error') {
        setPaymentError(result.message);
        setIsPaying(false);
        return;
      }
      try {
        await fetch('/reset/api/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: checkout.sessionId }),
        });
      } catch (error) {
        console.error('Reset confirm request failed:', error);
      }
      router.push(`/reset/return?session_id=${encodeURIComponent(checkout.sessionId)}`);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment could not be completed.');
      setIsPaying(false);
    }
  };

  const payer = checkout ? [checkout.firstName, checkout.lastName].filter(Boolean).join(' ') : '';
  const discounted = checkout?.discountPercent === 20;

  return (
    <div className="min-h-screen bg-black font-sans text-white">
      <Header />
      <main className="mx-auto max-w-lg px-4 pb-16 pt-28">
        <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-[#0FF1CE]">Payment portal</p>
        <h1 className="mt-3 text-center text-3xl font-bold text-white">Complete your payment</h1>
        {(phase === 'loading' || phase === 'ready') && (
          <p className="mt-3 text-center text-sm text-gray-400">
            Your card is charged a one-time fee. You can close this page after it succeeds.
          </p>
        )}

        {(phase === 'loading' || phase === 'leaving') && (
          <div className="mt-16 flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0FF1CE] border-t-transparent" />
            {phase === 'leaving' && <p className="text-sm text-gray-400">Payment received. Returning you now.</p>}
          </div>
        )}

        {phase === 'paid' && (
          <div className="mt-10 rounded-2xl border border-[#2F2F2F] bg-[#151515] p-6 text-center">
            <h2 className="text-xl font-bold text-white">Payment already completed</h2>
            <p className="mt-3 text-sm text-gray-400">This checkout has already been paid. A receipt is sent to the email on the order.</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-sm text-red-300">{message}</p>
            {ref && (
              <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-4 text-sm text-[#0FF1CE] underline">
                Try again
              </button>
            )}
          </div>
        )}

        {phase === 'ready' && checkout && (
          <div className="relative mt-8 rounded-2xl border border-[#2F2F2F]/50 bg-gradient-to-br from-[#1A1A1A]/80 to-[#151515]/80 p-6">
            {isPaying && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[#0FF1CE] border-t-transparent" />
                  <p className="text-sm text-white">Processing payment...</p>
                </div>
              </div>
            )}

            <dl className="space-y-2 text-sm">
              <SummaryRow label="Name" value={payer} />
              <SummaryRow label="Email" value={checkout.email} />
              <SummaryRow label="Phone" value={checkout.phone} />
              <SummaryRow label="Country" value={checkout.country} />
              <SummaryRow label="Size" value={checkout.sizeLabel} />
              <SummaryRow label="Reset" value={checkout.resetType} />
              <SummaryRow label="Platform" value={checkout.platform} />
            </dl>

            <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#2F2F2F] pt-5">
              <div className="text-sm text-gray-400">Amount due</div>
              <div className="text-right">
                {discounted && (
                  <div className="text-sm text-gray-500 line-through">{formatUsdFromCents(checkout.originalCents)}</div>
                )}
                <div className="text-3xl font-bold text-[#0FF1CE]">{formatUsdFromCents(checkout.amountCents)}</div>
              </div>
            </div>

            {!publishableKey && <p className="mt-6 text-sm text-red-400">Card checkout is not configured.</p>}
            {publishableKey && (
              <div className="mt-6">
                <VipCardPayment
                  ref={cardRef}
                  publishableKey={publishableKey}
                  clientSecret={checkout.clientSecret}
                  onTotal={() => undefined}
                />
              </div>
            )}

            {paymentError && (
              <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{paymentError}</p>
            )}

            <button
              type="button"
              onClick={pay}
              disabled={isPaying || !publishableKey}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#0FF1CE] to-[#00D4FF] py-3 font-bold text-black shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[#0FF1CE]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPaying ? 'Processing...' : `Pay ${formatUsdFromCents(checkout.amountCents)}`}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
