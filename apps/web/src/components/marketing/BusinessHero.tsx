export function BusinessHero() {
  return (
    <section className="relative overflow-hidden bg-[#F8F9FB] px-6 pb-20 pt-20">

      {/* Decorative dot-grid — top-right, reads as "data/intelligence" */}
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 opacity-[0.35]" aria-hidden="true">
        <svg width="288" height="288" viewBox="0 0 288 288" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 10 }, (_, row) =>
            Array.from({ length: 10 }, (_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={col * 28 + 16}
                cy={row * 28 + 16}
                r="1.5"
                fill="#0D1B3D"
              />
            ))
          )}
        </svg>
      </div>

      <div className="relative mx-auto max-w-4xl">

        {/* Eyebrow pill */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-green/40 px-4 py-1.5"
          style={{ background: 'rgba(0,182,122,0.08)' }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          <span className="text-xs font-bold uppercase tracking-widest text-green">For Business</span>
        </div>

        {/* Headline */}
        <h1
          className="mb-6 font-display text-5xl font-extrabold leading-[1.1] md:text-6xl"
          style={{ color: '#080F20' }}
        >
          Built for African business.
        </h1>

        {/* Subheadline */}
        <p className="mb-10 max-w-2xl text-lg leading-relaxed md:text-xl" style={{ color: '#4B5563' }}>
          GeoAfric deploys enterprise intelligence, fleet management, hospitality tools, and
          marketing reach — on one platform, backed by hands-on local support.
        </p>

        {/* CTAs */}
        <div className="mb-8 flex flex-wrap gap-4">
          <a
            href="#modules"
            className="rounded-xl bg-gold px-8 py-4 text-sm font-bold text-[#080F20] transition-opacity hover:opacity-90"
          >
            See our modules ↓
          </a>
          <a
            href="#enquire"
            className="rounded-xl border border-[#080F20] px-8 py-4 text-sm font-bold text-[#080F20] transition-colors hover:bg-[#080F20]/5"
          >
            Make a general enquiry →
          </a>
        </div>

        {/* Trust line */}
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green" />
          <span className="text-xs" style={{ color: '#6B7280' }}>
            Every engagement starts with a free audit. No commitment required.
          </span>
        </div>
      </div>
    </section>
  );
}
