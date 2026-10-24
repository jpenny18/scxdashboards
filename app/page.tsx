import ConsultationForm from '@/components/site/ConsultationForm';
import MarketingShell from '@/components/site/MarketingShell';

const features = [
  {
    title: 'Custom user dashboards',
    desc: 'Dashboards built for the people who use them, bringing operational data into one place for day-to-day decisions.',
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Admin dashboards',
    desc: 'Administrative portals for the people who run the business, covering records, workflows, and daily operations.',
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    title: 'AI-driven analytics',
    desc: 'An analytic overview that monitors performance metrics, automates reporting, and keeps the current picture in front of the team.',
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
  },
  {
    title: 'AI built in',
    desc: 'Integrated AI assistants so people can ask questions of their own business information from inside the software.',
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <MarketingShell bleed>
      <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pb-32 pt-40 text-center sm:px-6 lg:px-8">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-600/10 px-4 py-1.5 text-xs font-medium text-blue-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            Dashboard Solutions
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Custom dashboards{' '}
            <span className="text-blue-500">for modern businesses.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#8b949e] sm:text-xl">
            We design, develop, and deploy custom user dashboards and admin dashboards, with an AI-driven analytic overview and AI built into the software.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Request a consultation
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center rounded-lg border border-[#30363d] px-5 py-3 text-sm font-semibold text-white hover:border-[#8b949e]"
            >
              See what we build
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[#484f58]">
          <span className="text-xs">Scroll</span>
          <div className="h-8 w-0.5 bg-gradient-to-b from-[#484f58] to-transparent" />
        </div>
      </section>

      <section id="about" className="bg-[#0d1117] py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-500">About us</p>
              <h2 className="mb-6 text-3xl font-bold leading-snug text-white sm:text-4xl">
                Software built around how your business runs
              </h2>
              <p className="text-base leading-relaxed text-[#8b949e] sm:text-lg">
                SCX Dashboards is a B2B software development and technology services company. We build tailored dashboards and administrative portals that consolidate operational data, monitor performance, automate reporting, and let teams work with that information through AI.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {features.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 transition-colors duration-200 hover:border-blue-500/40"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10">
                    {card.icon}
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-white">{card.title}</h3>
                  <p className="text-xs leading-relaxed text-[#8b949e]">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#161b22] py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-500">Contact us</p>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">We&rsquo;d love to hear from you</h2>
            <p className="text-base text-[#8b949e] sm:text-lg">
              Request a consultation for a personalized demonstration, or to talk through the dashboards and AI tools you want built. Scope is agreed in writing before any payment.
            </p>
          </div>

          <div id="consultation">
            <ConsultationForm />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
