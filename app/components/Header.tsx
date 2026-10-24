import Image from 'next/image';

export default function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-[#2F2F2F]/60 bg-black backdrop-blur-md">
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0FF1CE]/40 to-transparent"></div>
      <div className="flex h-20 items-center justify-center">
        <Image
          src="/logo.png"
          alt="Shockwave Capital"
          width={80}
          height={80}
          className="h-auto w-auto drop-shadow-[0_0_12px_rgba(15,241,206,0.15)]"
          priority
        />
      </div>
    </header>
  );
}
