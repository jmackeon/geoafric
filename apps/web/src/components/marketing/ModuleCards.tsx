import Link from 'next/link';

const MODULES = [
  {
    emoji:    '🏢',
    id:       'enterprise',
    tag:      'ENTERPRISE',
    title:    'Corporate Dashboards & Workforce Ops',
    subtitle: 'Full-spectrum intelligence for corporate teams',
    features: [
      'Corporate dashboards',
      'Staff & HR management',
      'Operations analytics',
      'Enterprise reporting',
    ],
    learnHref: '/enterprise',
  },
  {
    emoji:    '🚚',
    id:       'logistics',
    tag:      'LOGISTICS',
    title:    'Real-Time Fleet Tracking & Route Intelligence',
    subtitle: 'Built for African roads and last-mile delivery',
    features: [
      'Vehicle & fleet tracking',
      'Container monitoring',
      'Route intelligence',
      'Driver management',
    ],
    learnHref: '/logistics',
  },
  {
    emoji:    '📣',
    id:       'reach',
    tag:      'REACH',
    title:    'Marketing & Customer Engagement',
    subtitle: 'Reach customers where they actually are',
    features: [
      'WhatsApp & SMS campaigns',
      'Customer segmentation',
      'AI content & promotions',
      'Campaign analytics',
    ],
    learnHref: '/reach',
  },
  {
    emoji:    '🏨',
    id:       'hospitality',
    tag:      'HOSPITALITY',
    title:    'Hotels, Reservations & Guest Management',
    subtitle: 'Modern hospitality ops for African properties',
    features: [
      'Hotel management',
      'Smart reservations',
      'Hospitality analytics',
      'Customer engagement',
    ],
    learnHref: '/hospitality',
  },
] as const;

export function ModuleCards() {
  return (
    <section id="modules" className="bg-[#f8f9fb] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-green">Our Modules</p>
        <h2 className="mb-14 font-display text-3xl font-bold text-navy md:text-4xl">
          Choose the solution that fits your problem.
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {MODULES.map(({ emoji, id, tag, title, subtitle, features, learnHref }) => (
            <div
              key={id}
              className="flex flex-col rounded-2xl bg-white p-8 shadow-card transition-shadow hover:shadow-card-hover"
            >
              {/* Icon + tag */}
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">{emoji}</span>
                <span className="rounded-full bg-navy px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  {tag}
                </span>
              </div>

              {/* Title + subtitle */}
              <h3 className="mb-1 font-display text-xl font-bold text-navy">{title}</h3>
              <p className="mb-6 text-sm text-gray-500">{subtitle}</p>

              {/* Feature bullets */}
              <ul className="mb-8 flex-1 space-y-2.5">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="mt-0.5 font-bold text-green" aria-hidden>—</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Link
                  href={`/business?module=${id}#enquire`}
                  className="block rounded-xl bg-green py-3 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  Book a pilot →
                </Link>
                <Link
                  href={learnHref}
                  className="block text-center text-sm font-semibold text-gray-400 transition-colors hover:text-navy"
                >
                  Learn more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
