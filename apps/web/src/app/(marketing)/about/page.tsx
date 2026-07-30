import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About GeoAfric — Built to Keep African Families Safe & Connected',
  description:
    'GeoAfric is a family safety platform built for African families who deserve tools designed for their reality. A product of Alpha-Z Technologies.',
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAFAFC] text-navy">
      {/* ── 1. HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white px-6 py-16 md:py-24 border-b border-gray-100">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-green">
                ABOUT GEOAFRIC
              </p>
              <h1 className="mb-6 font-display text-4xl font-extrabold leading-[1.15] text-navy md:text-5xl lg:text-6xl">
                We built GeoAfric to keep African families safe and <span className="text-green">connected.</span>
              </h1>
              <p className="mb-8 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                GeoAfric is a family safety platform — built for African families who deserve tools designed
                for their reality. A product of Alpha-Z Technologies, headquartered in Abuja, Nigeria.
              </p>
              <div>
                <span className="inline-block rounded-full bg-green px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                  Family Safety Platform
                </span>
              </div>
            </div>

            {/* Right Floating Dark Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                
                {/* Decorative Dot Matrix Grid (Top Right) */}
                <div 
                  className="absolute -top-6 -right-6 z-0 grid grid-cols-8 gap-2.5 opacity-60" 
                  aria-hidden="true"
                >
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div key={i} className="h-1.5 w-1.5 rounded-full bg-teal/50" />
                  ))}
                </div>

                {/* Card Container */}
                <div className="relative z-10 rounded-2xl bg-[#080F20] p-8 shadow-2xl border border-white/10">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-teal">
                    FOUNDED IN ABUJA
                  </p>
                  <h3 className="mb-2 font-display text-2xl font-bold text-white">
                    Alpha-Z Technologies
                  </h3>
                  <p className="mb-6 text-sm font-medium text-slate-400">
                    Nigeria · Ghana · Ivory Coast
                  </p>
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-sm font-bold text-teal">
                      Pan-African Technology
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. OUR STORY SECTION ────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-20 md:py-24 border-b border-gray-100">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-green">
            OUR STORY
          </p>
          <h2 className="mb-12 font-display text-3xl font-bold text-navy md:text-4xl">
            The problem we couldn't ignore.
          </h2>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left Story Text with vertical green bar */}
            <div className="lg:col-span-8 border-l-4 border-green pl-6 md:pl-8 space-y-6 text-slate-600 text-base md:text-lg leading-relaxed">
              <p>
                In Nigeria, a parent sending their child to school by bus has no reliable way to know they arrived safely.
              </p>
              <p>
                A mother in Accra cannot track whether her elderly parent has wandered from home. A father in Abidjan has no SOS button to press when his child doesn't come home from school.
              </p>
              <p>
                These are not edge cases. These are the everyday realities of raising a family in West Africa. Existing solutions were too expensive, not localised, or built to move African data outside Africa.
              </p>
              <p className="font-medium text-navy">
                We built GeoAfric because no one else was building the right solution — built here, for here, staying here.
              </p>
            </div>

            {/* Right Stat Cards */}
            <div className="lg:col-span-4 space-y-4">
              {/* Card 1 */}
              <div className="flex items-stretch rounded-2xl bg-[#F7F9FC] border border-gray-100 overflow-hidden shadow-sm">
                <div className="w-2.5 bg-green shrink-0" />
                <div className="p-6">
                  <p className="font-display text-4xl font-extrabold text-navy">3</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">Countries at launch</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex items-stretch rounded-2xl bg-[#F7F9FC] border border-gray-100 overflow-hidden shadow-sm">
                <div className="w-2.5 bg-gold shrink-0" />
                <div className="p-6">
                  <p className="font-display text-4xl font-extrabold text-navy">8</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">African languages</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="flex items-stretch rounded-2xl bg-[#F7F9FC] border border-gray-100 overflow-hidden shadow-sm">
                <div className="w-2.5 bg-teal shrink-0" />
                <div className="p-6">
                  <p className="font-display text-4xl font-extrabold text-navy">1</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">Family platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. WHAT WE'RE BUILDING TOWARD SECTION ───────────────────────────── */}
      <section className="relative overflow-hidden bg-[#080F20] px-6 py-20 md:py-28 text-white">
        {/* Subtle circular background glow graphic */}
        <div 
          className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-teal/10 blur-3xl" 
          aria-hidden="true" 
        />

        <div className="relative mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-teal">
            WHAT WE'RE BUILDING TOWARD
          </p>
          <h2 className="mb-8 font-display text-3xl font-bold text-white md:text-4xl lg:text-5xl max-w-3xl">
            Africa's connected family safety platform.
          </h2>
          
          <p className="mb-12 max-w-4xl text-base leading-relaxed text-slate-300 md:text-lg">
            We are building a platform that gets smarter with every family it protects. GeoAfric starts in Nigeria. 
            It grows through Ghana and Ivory Coast. It expands across the continent. Every data point stays in-country. 
            Every insight compounds. Nothing is sold. In ten years, the infrastructure we are building today keeps 
            millions of African families safe, connected, and in control of their own data.
          </p>

          {/* Process Flywheel Horizontal Pills */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <span className="rounded-full bg-green/20 border border-green/50 px-5 py-2.5 text-xs md:text-sm font-bold text-green">
              More families
            </span>
            <span className="text-teal font-bold text-lg">→</span>
            
            <span className="rounded-full bg-white/[0.08] border border-white/10 px-5 py-2.5 text-xs md:text-sm font-medium text-slate-300">
              generates signal
            </span>
            <span className="text-teal font-bold text-lg">→</span>

            <span className="rounded-full bg-white/[0.08] border border-white/10 px-5 py-2.5 text-xs md:text-sm font-medium text-slate-300">
              signal improves features
            </span>
            <span className="text-teal font-bold text-lg">→</span>

            <span className="rounded-full bg-white/[0.08] border border-white/10 px-5 py-2.5 text-xs md:text-sm font-medium text-slate-300">
              advantage compounds
            </span>
          </div>
        </div>
      </section>

      {/* ── 4. HOW WE BUILD SECTION ─────────────────────────────────────────── */}
      <section className="bg-white px-6 py-20 md:py-24 border-b border-gray-100">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-green">
            HOW WE BUILD
          </p>
          <h2 className="mb-14 font-display text-3xl font-bold text-navy md:text-4xl">
            The principles that guide every decision.
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Card 1 */}
            <div className="flex rounded-2xl bg-[#F7F9FC] border border-gray-100 overflow-hidden shadow-card transition-shadow hover:shadow-card-hover">
              <div className="w-2.5 bg-green shrink-0" />
              <div className="p-8">
                <h3 className="mb-3 font-display text-xl font-bold text-navy">
                  Your data never leaves.
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  All personal, location, and health data is stored in-country and never sold. 
                  Our intelligence flywheel compounds internally — making GeoAfric smarter for your family, not for advertisers.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex rounded-2xl bg-[#F7F9FC] border border-gray-100 overflow-hidden shadow-card transition-shadow hover:shadow-card-hover">
              <div className="w-2.5 bg-gold shrink-0" />
              <div className="p-8">
                <h3 className="mb-3 font-display text-xl font-bold text-navy">
                  We build when families need it.
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  GeoAfric does not build features on speculation. Every feature we deploy was asked for by real families 
                  or users before development began. This keeps the platform focused and directly useful.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex rounded-2xl bg-[#F7F9FC] border border-gray-100 overflow-hidden shadow-card transition-shadow hover:shadow-card-hover">
              <div className="w-2.5 bg-teal shrink-0" />
              <div className="p-8">
                <h3 className="mb-3 font-display text-xl font-bold text-navy">
                  One platform. Never rebuilt.
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Every GeoAfric feature — location, health, discovery, SOS — runs on the same backend. 
                  Every improvement benefits every user, and every new capability ships faster than the last.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="flex rounded-2xl bg-[#F7F9FC] border border-gray-100 overflow-hidden shadow-card transition-shadow hover:shadow-card-hover">
              <div className="w-2.5 bg-navy shrink-0" />
              <div className="p-8">
                <h3 className="mb-3 font-display text-xl font-bold text-navy">
                  Responsible technology, not surveillance.
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  GeoAfric is consent-based. Family members choose to share their location. No family member can 
                  be tracked without explicit consent. Alpha-Z Secure — our government-facing security division — 
                  is kept as a legally separate entity to protect this boundary absolutely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. WHERE WE OPERATE SECTION ─────────────────────────────────────── */}
      <section className="bg-[#FAFAFC] px-6 py-20 md:py-24 border-b border-gray-100">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-green">
            WHERE WE OPERATE
          </p>
          <h2 className="mb-2 font-display text-3xl font-bold text-navy md:text-4xl">
            Three countries. One platform. More coming.
          </h2>
          <p className="mb-10 text-base text-slate-500">
            We expand into each market only when the preceding one is self-funding.
          </p>

          {/* 3 Country Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
            
            {/* Country 1: Nigeria */}
            <div className="flex flex-col justify-between rounded-2xl bg-white border-t-4 border-green p-7 shadow-card transition-shadow hover:shadow-card-hover">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold text-navy">Nigeria</h3>
                  <span className="rounded-md bg-green px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    HQ
                  </span>
                </div>
                <p className="mb-4 text-sm font-bold text-green">Abuja (HQ)</p>
                <div className="space-y-1 text-sm text-slate-500">
                  <p>Founding market.</p>
                  <p>Family safety & Consumer.</p>
                </div>
              </div>
            </div>

            {/* Country 2: Ghana */}
            <div className="flex flex-col justify-between rounded-2xl bg-white border-t-4 border-teal p-7 shadow-card transition-shadow hover:shadow-card-hover">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold text-navy">Ghana</h3>
                </div>
                <p className="mb-4 text-sm font-bold text-teal">Accra</p>
                <div className="space-y-1 text-sm text-slate-500">
                  <p>Technical development hub.</p>
                  <p>Platform engineering.</p>
                </div>
              </div>
            </div>

            {/* Country 3: Ivory Coast */}
            <div className="flex flex-col justify-between rounded-2xl bg-white border-t-4 border-gold p-7 shadow-card transition-shadow hover:shadow-card-hover">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold text-navy">Ivory Coast</h3>
                </div>
                <p className="mb-4 text-sm font-bold text-gold">Abidjan</p>
                <div className="space-y-1 text-sm text-slate-500">
                  <p>Regional expansion.</p>
                  <p>Consumer pilots.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Expanding Dark Bar Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#080F20] px-6 py-5 border border-white/10 text-white shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-teal">
                EXPANDING →
              </span>
            </div>
            <p className="text-sm font-medium text-slate-300 tracking-wide">
              Kenya &nbsp;·&nbsp; Rwanda &nbsp;·&nbsp; South Africa &nbsp;·&nbsp; Morocco &nbsp;·&nbsp; and beyond
            </p>
          </div>

        </div>
      </section>

      {/* ── 6. CTA SECTION ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#080F20] px-6 py-24 text-center text-white">
        {/* Glowing background radial blur */}
        <div 
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,182,122,0.15)_0,transparent_70%)]" 
          aria-hidden="true" 
        />

        <div className="relative mx-auto max-w-4xl">
          <p className="mb-4 text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
            Whether you are protecting your family or curious about GeoAfric — we built this for you.
          </p>

          <h2 className="mb-8 font-display text-4xl font-extrabold text-white md:text-5xl">
            Ready to get started?
          </h2>

          <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://app.geoafric.com/auth/register"
              className="rounded-xl bg-gold px-8 py-4 text-sm font-bold text-[#080F20] transition-opacity hover:opacity-90 shadow-glow-gold"
            >
              Download the app
            </a>
            <Link
              href="/business"
              className="rounded-xl border border-white/20 px-8 py-4 text-sm font-bold text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Alpha-Z Enterprise →
            </Link>
          </div>

          <p className="text-xs tracking-widest text-white/30 font-mono">
            geoafric.com/about
          </p>
        </div>
      </section>
    </div>
  );
}
