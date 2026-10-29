'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import { isAllowedResetRedirect } from '../urls';

type View = 'loading' | 'pending' | 'received' | 'error';

export default function ResetReturnClient() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const [view, setView] = useState<View>('loading');
  const [message, setMessage] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');

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
            if (typeof data.cancelUrl === 'string') setCancelUrl(data.cancelUrl);
          }
          return;
        }
        if (typeof data.cancelUrl === 'string') setCancelUrl(data.cancelUrl);

        if (data.paymentStatus === 'paid') {
          const completed = await fetch('/reset/api/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          const result = await completed.json();
          if (!cancelled && completed.ok && result.paid && typeof result.returnUrl === 'string' && isAllowedResetRedirect(result.returnUrl)) {
            window.location.replace(result.returnUrl);
            return;
          }
          if (!cancelled) {
            setView('received');
            setMessage(result.error || 'Payment received. Confirmation is still processing. Refresh this page in a moment.');
          }
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

  const canLeave = isAllowedResetRedirect(cancelUrl);

  return (
    <div className="min-h-screen bg-black font-sans text-white">
      <Header />
      <main className="mx-auto max-w-lg px-4 pb-16 pt-32 text-center">
        {view === 'loading' && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0FF1CE] border-t-transparent" />
            <p className="text-sm text-gray-400">Confirming payment...</p>
          </div>
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

        {view === 'received' && (
          <>
            <h1 className="text-3xl font-bold text-white">Payment received</h1>
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

        {canLeave && view !== 'loading' && (
          <a href={cancelUrl} className="mt-6 inline-block text-sm text-gray-400 underline">
            Cancel and return
          </a>
        )}
      </main>
    </div>
  );
}
