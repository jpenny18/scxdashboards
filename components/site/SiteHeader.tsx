'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const sections = [
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[#30363d] bg-[#0d1117]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/scx-logo.png"
            alt=""
            width={3840}
            height={2160}
            priority
            className="h-11 w-auto"
          />
          <span className="text-sm font-semibold text-white">SCX Dashboards</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {sections.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[#8b949e] transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/#contact"
            className="hidden rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 sm:inline-flex"
          >
            Request a consultation
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#30363d] text-white lg:hidden"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex w-4 flex-col gap-1">
              <span className="h-0.5 w-full bg-white" />
              <span className="h-0.5 w-full bg-white" />
              <span className="h-0.5 w-full bg-white" />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[#30363d] bg-[#0d1117] px-4 py-3 lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {sections.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-[#c9d1d9] hover:bg-[#161b22]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Request a consultation
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
