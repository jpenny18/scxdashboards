import Header from "./components/Header";
import Footer from "./components/Footer";
import ContactForm from "./components/ContactForm";
import HeroButtons from "./components/HeroButtons";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section
          id="hero"
          className="relative flex items-center justify-center min-h-screen overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32 pt-40">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              Dashboard Solutions
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight mb-6">
              Simple dashboard solutions{" "}
              <span className="text-blue-500">for modern businesses.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#8b949e] max-w-2xl mx-auto leading-relaxed mb-10">
              
Our goal is to transform your business data into powerful insights and to help you scale through automation.
            </p>

            <HeroButtons />
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#484f58]">
            <span className="text-xs">Scroll</span>
            <div className="w-0.5 h-8 bg-gradient-to-b from-[#484f58] to-transparent" />
          </div>
        </section>

        {/* ── About Us ─────────────────────────────────────────── */}
        <section id="about" className="py-28 bg-[#0d1117]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Text */}
              <div>
                <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-4">
                  About Us
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug mb-6">
                  Dedicated to advancing your business
                </h2>
                <p className="text-[#8b949e] leading-relaxed text-base sm:text-lg">
                  We are dedicated with assisting business owners in advancing
                  their enterprises through innovative technology solutions that
                  address challenges and facilitate growth through automation.
                </p>
              </div>

              {/* Feature cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: (
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ),
                    title: "Custom Dashboards",
                    desc: "Custom dashboards that aggregate, analyze, and support data-driven decision-making.",
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    ),
                    title: "Real-Time Insights",
                    desc: "Real-time updates of key performance metrics enable our clients to make informed decisions based on the most current information available.",
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                        />
                      </svg>
                    ),
                    title: "Performance Tracking",
                    desc: "Our dashboards use calculators, tools, levers, gauges, and dials to track the critical drivers of our clients' businesses.",
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    ),
                    title: "Seamless Integration",
                    desc: "Our downstream dashboards ensure seamless integration and informed decision-making across all business departments by providing user-friendly data dashboards at each level of operation.",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 hover:border-blue-500/40 transition-colors duration-200"
                  >
                    <div className="w-9 h-9 bg-blue-600/10 rounded-lg flex items-center justify-center mb-3">
                      {card.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#8b949e] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Contact Us ───────────────────────────────────────── */}
        <section id="contact" className="py-28 bg-[#161b22]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-4">
                Contact Us
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                We&rsquo;d love to hear from you
              </h2>
              <p className="text-[#8b949e] text-base sm:text-lg">
              Feel free to contact us for a personalized demonstration or to discuss pricing and implementation options.
              </p>
            </div>

            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
