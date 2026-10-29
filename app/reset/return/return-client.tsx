'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';

type View = 'loading' | 'paid' | 'pending' | 'error';

export default function ResetReturnClient() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const [view, setView] = useState<View>('loading');
  const [message, setMessage] = useState('');
  const [amountCents, setAmountCents] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setView('error');
      setMessage('This return link is missing a payment session.');
      return;
    }

    let cancelled = false;

    const confirm = async () => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const response = await fetch(`/reset/api/session?session_id=${encodeURIComponent(sessionId)}`);
        const data = await response.json();
        if (!response.ok) {
          if (!cancelled) {
            setView('error');
            setMessage(data.error || 'Unable to confirm this payment.');
          }
          return;
        }

        if (typeof data.amountCents === 'number') setAmountCents(data.amountCents);

        if (data.paymentStatus === 'paid') {
          await fetch('/reset/api/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          if (!cancelled) setView('paid');
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!cancelled) {
        setView('pending');
        setMessage('Your card payment is still processing. Refresh this page in a moment.');
      }
    };

    confirm().catch(() => {
      if (!cancelled) {
        setView('error');
        setMessage('Unable to confirm this payment.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const amount =
    amountCents === null ? '' : (amountCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="min-h-screen bg-black font-sans text-white">
      <Header />
      <main className="mx-auto max-w-lg px-4 pb-16 pt-32 text-center">
        {view === 'loading' && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0FF1CE] border-t-transparent" />
          </div>
        )}

        {view === 'paid' && (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#0FF1CE] to-[#00D9FF]">
              <svg className="h-10 w-10 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Payment received</h1>
            {amount && <p className="mt-3 text-2xl font-bold text-[#0FF1CE]">{amount}</p>}
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Your payment was successful. A receipt is on the way to your email. You can close this page.
            </p>
          </>
        )}

        {view === 'pending' && (
          <>
            <h1 className="text-3xl font-bold text-white">Payment processing</h1>
            <p className="mt-4 text-sm text-gray-400">{message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-gradient-to-r from-[#0FF1CE] to-[#00D4FF] px-6 py-3 font-bold text-black"
            >
              Refresh
            </button>
          </>
        )}

        {view === 'error' && (
          <>
            <h1 className="text-3xl font-bold text-white">Payment not completed</h1>
            <p className="mt-4 text-sm text-gray-400">{message}</p>
          </>
        )}
      </main>
    </div>
  );
}
