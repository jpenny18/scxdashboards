'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import VipCardPayment, { type VipCardHandle } from '../vip/components/VipCardPayment';
import { formatUsdFromCents } from './config';

type Phase = 'loading' | 'ready' | 'paid' | 'error';

type ReadyCheckout = {
  clientSecret: string;
  sessionId: string;
  amountCents: number;
  originalCents: number;
  email: string;
  firstName: string;
  lastName: string;
};

export default function CheckoutClient({ publishableKey }: { publishableKey: string }) {
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

    const load = async () => {
      const response = await fetch('/checkout/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref }),
      });
      const data = await response.json();
      if (cancelled) return;
      if (data.paid) {
        if (data.sessionId) {
          router.replace(`/checkout/return?session_id=${encodeURIComponent(data.sessionId)}`);
          return;
        }
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
        email: String(data.email || ''),
        firstName: String(data.firstName || ''),
        lastName: String(data.lastName || ''),
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
  }, [ref, attempt, router]);

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
        await fetch('/checkout/api/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: checkout.sessionId }),
        });
      } catch (error) {
        console.error('Checkout confirm request failed:', error);
      }
      router.push(`/checkout/return?session_id=${encodeURIComponent(checkout.sessionId)}`);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment could not be completed.');
      setIsPaying(false);
    }
  };

  const payer = checkout ? [checkout.firstName, checkout.lastName].filter(Boolean).join(' ') : '';
  const discounted = checkout ? checkout.originalCents > checkout.amountCents : false;

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

        {phase === 'loading' && (
          <div className="mt-16 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0FF1CE] border-t-transparent" />
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

            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <div className="text-sm text-gray-400">Amount due</div>
                {payer && <div className="mt-1 text-sm text-white">{payer}</div>}
                {checkout.email && <div className="text-xs text-gray-500">{checkout.email}</div>}
              </div>
              <div className="text-right">
                {discounted && (
                  <div className="text-sm text-gray-500 line-through">{formatUsdFromCents(checkout.originalCents)}</div>
                )}
                <div className="text-3xl font-bold text-[#0FF1CE]">{formatUsdFromCents(checkout.amountCents)}</div>
              </div>
            </div>

            {!publishableKey && <p className="text-sm text-red-400">Card checkout is not configured.</p>}
            {publishableKey && (
              <VipCardPayment
                ref={cardRef}
                publishableKey={publishableKey}
                clientSecret={checkout.clientSecret}
                onTotal={() => undefined}
              />
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
