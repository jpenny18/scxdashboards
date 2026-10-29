import { Suspense } from 'react';
import type { Metadata } from 'next';
import ResetClient from './reset-client';

export const metadata: Metadata = {
  title: 'Payment',
  description: 'Complete your payment.',
  robots: { index: false, follow: false },
};

export default function ResetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0FF1CE] border-t-transparent" />
        </div>
      }
    >
      <ResetClient publishableKey={process.env.VIPPK || ''} />
    </Suspense>
  );
}
