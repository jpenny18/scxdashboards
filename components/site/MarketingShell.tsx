import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

export default function MarketingShell({
  children,
  bleed = false,
}: {
  children: React.ReactNode;
  bleed?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117] text-white">
      <SiteHeader />
      <main className={bleed ? 'flex-1' : 'flex-1 pt-16'}>{children}</main>
      <SiteFooter />
    </div>
  );
}
