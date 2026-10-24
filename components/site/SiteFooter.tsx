import Image from 'next/image';
import Link from 'next/link';

const legal = [
  { href: '/terms', label: 'Terms of service' },
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/refund', label: 'Refunds and cancellation' },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#30363d] bg-[#0d1117]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image src="/scx-logo.png" alt="" width={3840} height={2160} className="h-12 w-auto" />
            <span className="text-sm font-semibold text-white">SCX Dashboards</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-[#8b949e]">
            Custom business intelligence dashboards, administrative portals, AI-powered analytics, and integrated AI assistants for businesses.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/#about" className="text-[#c9d1d9] hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/#contact" className="text-[#c9d1d9] hover:text-white">
                Request a consultation
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">Legal</p>
          <ul className="mt-3 space-y-2 text-sm">
            {legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[#c9d1d9] hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-[#30363d]">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs leading-relaxed text-[#8b949e] sm:px-6">
          © {new Date().getFullYear()} SCX Dashboards.
        </p>
      </div>
    </footer>
  );
}
