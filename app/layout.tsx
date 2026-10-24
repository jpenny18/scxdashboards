import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'SCX Dashboards',
    template: '%s · SCX Dashboards',
  },
  description:
    'SCX Dashboards designs and deploys custom business intelligence dashboards, administrative portals, AI-powered analytics, and integrated AI assistants for businesses.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black">
      <body className="min-h-screen overflow-x-hidden bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
