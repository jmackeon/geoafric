import { headers } from 'next/headers';
import Link from 'next/link';
import { MapPin, Heart, Shield, Compass } from 'lucide-react';
import { PricingSection } from '@/components/marketing/PricingSection';
import type { Currency } from '@/components/marketing/PricingSection';

function detectCurrency(country: string): Currency {
  if (country === 'NG') return 'NGN';
  if (country === 'GH') return 'GHS';
  if (country === 'CI') return 'XOF';
  return 'USD';
}

// Simplified Africa continent silhouette — decorative watermark only
const AFRICA_PATH =
  'M200,20 C175,18 152,30 138,48 C118,72 112,96 98,120 C78,152 58,168 44,202 ' +
  'C28,238 24,272 28,306 C32,342 50,368 64,396 C78,424 78,452 98,476 ' +
  'C116,498 144,510 172,512 C196,514 218,504 240,492 C266,478 290,462 310,442 ' +
  'C332,420 348,394 356,364 C366,332 368,298 364,264 C360,228 346,202 328,178 ' +
  'C310,154 288,140 268,116 C250,94 242,68 226,46 C212,28 210,22 200,20Z';

const FEATURES = [
  {
    icon:   MapPin,
    title:  'Family Tracking',
    desc:   'Live location updates every 30 seconds. Set geofence zones and get instant alerts when family members arrive or leave.',
    color:  'text-green',
    iconBg: 'bg-green/10',
    border: 'border-t-green',
  },
  {
    icon:   Heart,
    title:  'Health Monitoring',
    desc:   'Track heart rate, steps, sleep, and hydration. AI-generated insights help your family stay ahead of health issues.',
    color:  'text-teal',
    iconBg: 'bg-teal/10',
    border: 'border-t-teal',
  },
  {
    icon:   Shield,
    title:  'Emergency SOS',
    desc:   'Hold to confirm in 3 seconds. All family members are alerted instantly with your real-time GPS coordinates.',
    color:  'text-gold',
    iconBg: 'bg-gold/10',
    border: 'border-t-gold',
  },
  {
    icon:   Compass,
    title:  'Place Discovery',
    desc:   'Save favourite places, discover nearby spots, and get city-aware suggestions tailored to where you live.',
    color:  'text-navy',
    iconBg: 'bg-navy/10',
    border: 'border-t-navy',
  },
] as const;

const LANGUAGES = [
  { flag: '🇬🇧', name: 'English'   },
  { flag: '🇫🇷', name: 'Français'  },
  { flag: '🇬🇭', name: 'Twi'       },
  { flag: '🇳🇬', name: 'Hausa'     },
  { flag: '🇳🇬', name: 'Yorùbá'    },
  { flag: '🇰🇪', name: 'Kiswahili' },
  { flag: '🇪🇹', name: 'አማርኛ'      },
  { flag: '🇸🇦', name: 'العربية'   },
];

const BUSINESS_MODULES = [
  {
    emoji:    '🏢',
    id:       'enterprise',
    module:   'ENTERPRISE',
    title:    'Enterprise Operations',
    subtitle: 'Full-spectrum intelligence for corporate teams',
    features: [
      'Staff location monitoring',
      'Asset tracking & geofencing',
      'AI-powered incident reporting',
      'Custom dashboards & SLA docs',
    ],
  },
  {
    emoji:    '🚚',
    id:       'logistics',
    module:   'LOGISTICS',
    title:    'Logistics & Fleet',
    subtitle: 'Real-time fleet tracking built for African roads',
    features: [
      'Live driver & vehicle tracking',
      'Route optimisation',
      'Delivery confirmation',
      'Fuel & maintenance alerts',
    ],
  },
  {
    emoji:    '📣',
    id:       'reach',
    module:   'REACH',
    title:    'Reach — Field Force',
    subtitle: 'Track and empower your on-ground teams',
    features: [
      'Field agent check-ins',
      'Territory mapping',
      'Customer visit logs',
      'Daily performance reports',
    ],
  },
  {
    emoji:    '🏨',
    id:       'hospitality',
    module:   'HOSPITALITY',
    title:    'Hospitality Safety',
    subtitle: 'Guest safety and staff coordination',
    features: [
      'Guest location sharing',
      'Staff emergency response',
      'Property geofencing',
      'Incident logging & reporting',
    ],
  },
];

export default function HomePage() {
  const country         = headers().get('x-vercel-ip-country') ?? '';
  const defaultCurrency = detectCurrency(country);

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#080F20] px-6 pb-24 pt-20">

        {/* Africa watermark — right side, clipped by overflow-hidden on section */}
        <div
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-[0.06]"
          aria-hidden="true"
        >
          <svg viewBox="0 0 400 540" width="520" height="680" xmlns="http://www.w3.org/2000/svg">
            <path fill="white" d={AFRICA_PATH} />
          </svg>
        </div>

        <div className="relative mx-auto max-w-4xl">

          {/* Badge pill */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-green/30 bg-green/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            <span className="text-xs font-bold uppercase tracking-widest text-green">
              Built in Africa · For Africa
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-display text-5xl font-extrabold leading-[1.1] text-white md:text-6xl">
            Your family. Your business.{' '}
            <span className="text-green">Protected.</span>
          </h1>

          {/* Sub-headline */}
          <p className="mb-6 max-w-2xl text-lg leading-relaxed text-white/60 md:text-xl">
            GeoAfric connects family safety, health monitoring, and business intelligence
            on one AI-powered platform — built for African realities.
          </p>

          {/* Trust line */}
          <div className="mb-10 flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green" />
            <span className="text-xs text-white/40">
              Your data is never sold. Hosted in-country. Always yours.
            </span>
          </div>

          {/* CTAs */}
          <div className="mb-14 flex flex-wrap gap-4">
            <Link
              href="/auth/register"
              className="rounded-xl bg-gold px-8 py-4 text-sm font-bold text-[#080F20] transition-opacity hover:opacity-90"
            >
              Start for free
            </Link>
            <Link
              href="/business"
              className="rounded-xl border border-white/20 px-8 py-4 text-sm font-bold text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Book a business pilot →
            </Link>
          </div>

          {/* Audience cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { emoji: '👨‍👩‍👧‍👦', title: 'For Families',   desc: 'Keep everyone safe and connected in real time.'              },
              { emoji: '🏢',       title: 'For Business',  desc: 'Fleet, field force, and enterprise intelligence.'             },
              { emoji: '🌍',       title: 'Pan-African',   desc: '8 languages, 3 countries, 100% data sovereignty.'            },
            ].map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.06] p-6 backdrop-blur-sm"
              >
                <span className="mb-3 block text-2xl">{emoji}</span>
                <p className="mb-1 font-display text-sm font-bold text-white">{title}</p>
                <p className="text-sm leading-relaxed text-white/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────────────────────────── */}
      <section className="bg-navy px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4">
          {[
            'Nigeria · Ghana · Ivory Coast',
            '8 African languages',
            'Data stays in-country',
            'Mobile-first platform',
            'A product of Alpha-Z Technologies',
          ].map((item, i) => (
            <div key={item} className="flex items-center gap-4">
              {i > 0 && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green" aria-hidden />}
              <span className="text-xs font-semibold text-white/50">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-green">The Platform</p>
          <h2 className="mb-14 font-display text-3xl font-bold text-navy md:text-4xl">
            Everything your family needs, one app.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, desc, color, iconBg, border }) => (
              <div
                key={title}
                className={`rounded-2xl border-t-[3px] bg-white p-8 shadow-card transition-shadow hover:shadow-card-hover ${border}`}
              >
                <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold text-navy">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUILT FOR AFRICA ────────────────────────────────────────────────── */}
      <section className="bg-[#080F20] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-teal">Built for Africa</p>
          <h2 className="mb-10 font-display text-3xl font-bold text-white md:text-4xl">
            In the language you actually speak.
          </h2>

          {/* Language pills */}
          <div className="mb-14 flex flex-wrap gap-3">
            {LANGUAGES.map(({ flag, name }) => (
              <span
                key={name}
                className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white"
              >
                {flag} {name}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { value: '8',    label: 'Languages at launch'   },
              { value: '3',    label: 'Countries at launch'   },
              { value: '100%', label: 'Data stays in-country' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-display text-4xl font-extrabold text-green">{value}</p>
                <p className="mt-1 text-sm text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR BUSINESS ────────────────────────────────────────────────────── */}
      <section id="for-business" className="bg-[#f8f9fb] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-green">For Business</p>
          <h2 className="mb-14 font-display text-3xl font-bold text-navy md:text-4xl">
            One platform. Every business need.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {BUSINESS_MODULES.map(({ emoji, id, module, title, subtitle, features }) => (
              <div
                key={module}
                className="flex flex-col rounded-2xl bg-white p-8 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl">{emoji}</span>
                  <span className="rounded-full bg-navy px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                    {module}
                  </span>
                </div>
                <h3 className="mb-1 font-display text-xl font-bold text-navy">{title}</h3>
                <p className="mb-6 text-sm text-gray-500">{subtitle}</p>
                <ul className="mb-8 flex-1 space-y-2.5">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="mt-0.5 font-bold text-green" aria-hidden>—</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/business?module=${id}#enquire`}
                  className="self-start text-sm font-bold text-green transition-opacity hover:opacity-80"
                >
                  Book a pilot →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <PricingSection defaultCurrency={defaultCurrency} />
    </>
  );
}
