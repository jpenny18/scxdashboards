import { Suspense } from 'react';
import type { Metadata } from 'next';
import VipClient from './vip-client';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your payment.',
  robots: { index: false, follow: false },
};

export default function VipPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0FF1CE] border-t-transparent" />
        </div>
      }
    >
      <VipClient publishableKey={process.env.VIPPK || ''} />
    </Suspense>
  );
}
