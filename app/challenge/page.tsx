import MarketingShell from '@/components/site/MarketingShell';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Challenge checkout',
  description: 'Reserved route for a second checkout. Payment is not available here.',
};

/**
 * Reserved route for a second checkout.
 * Leave this page in place so /challenge and the nav slot stay available.
 * Do not add prices, Stripe, or order handling until that checkout is built.
 */
export default function ChallengeCheckoutSlotPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">Reserved route</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Challenge checkout</h1>
        <p className="mt-6 text-base leading-relaxed text-[#8b949e]">
          This route is reserved for a second checkout. It is not open, and there is nothing to pay here.
        </p>
        <p className="mt-4 text-base leading-relaxed text-[#8b949e]">
          SCX Dashboards projects start with a consultation. Scope, price, and delivery are agreed in writing before payment. The VIP checkout at{' '}
          <Link href="/vip" className="text-blue-400 hover:text-blue-300">
            /vip
          </Link>{' '}
          is a separate purchase and is not a substitute for a custom project agreement.
        </p>
        <Link
          href="/#consultation"
          className="mt-8 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Request a consultation
        </Link>
      </section>
    </MarketingShell>
  );
}
