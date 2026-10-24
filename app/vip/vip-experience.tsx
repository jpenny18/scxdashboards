'use client';

import React, { Suspense } from 'react';
import Header from '../components/Header';
import VipCheckout from './components/VipCheckout';

function VipContent({ publishableKey }: { publishableKey: string }) {
  return (
    <div className="min-h-screen bg-black font-sans text-white">
      <Header />
      <div className="pt-20">
        <VipCheckout publishableKey={publishableKey} />
      </div>
    </div>
  );
}

export default function VipExperience({ publishableKey }: { publishableKey: string }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0FF1CE] border-t-transparent"></div>
        </div>
      }
    >
      <VipContent publishableKey={publishableKey} />
    </Suspense>
  );
}
