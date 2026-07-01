import type { Metadata } from 'next';
import { Radio, Target, Users, BarChart2, Globe, MessageSquare } from 'lucide-react';
import { ModulePageHero } from '@/components/marketing/ModulePageHero';
import { ModulePilotCTA } from '@/components/marketing/ModulePilotCTA';
import { ModuleEnquiryFooter } from '@/components/marketing/ModuleEnquiryFooter';

export const metadata: Metadata = {
  title: 'Reach — GeoAfric for Business',
  description:
    'Location-aware mobile marketing for African brands. Push offers to customers near your stores — in their language.',
};

const FEATURES = [
  {
    icon: Target,
    title: 'Geo-targeted campaigns',
    body:  'Push promotions to users within a radius of any store, market, or event — triggered by proximity, not guesswork.',
  },
  {
    icon: Globe,
    title: '20+ African languages',
    body:  'Deliver messages in English, French, Twi, Yorùbá, Hausa, Kiswahili, Amharic, Arabic, and more. One campaign, many languages.',
  },
  {
    icon: MessageSquare,
    title: 'In-app + push notifications',
    body:  'Reach GeoAfric users via in-app banners and push notifications — no need to build your own mobile channel.',
  },
  {
    icon: Users,
    title: 'Audience segments',
    body:  'Filter by country, city, family plan tier, and activity patterns. Exclude inactive users automatically.',
  },
  {
    icon: BarChart2,
    title: 'Campaign analytics',
    body:  'Real-time open rates, click-throughs, and proximity conversions. A/B testing included.',
  },
  {
    icon: Radio,
    title: 'Always-on store alerts',
    body:  'Set a permanent geo-trigger for your store. Any nearby GeoAfric user who opts in receives your message automatically.',
  },
];

const STEPS = [
  {
    num:   '01',
    title: 'Define your audience',
    body:  'Pick your geography — a city, a neighbourhood, or a custom-drawn radius around your venue. Filter by language, plan tier, or user activity.',
  },
  {
    num:   '02',
    title: 'Write your campaign',
    body:  'Use our simple campaign builder. We translate automatically to each user\'s preferred language, or you can supply your own copy per language.',
  },
  {
    num:   '03',
    title: 'Launch and measure',
    body:  'Campaigns go live immediately. Watch open rates, clicks, and conversions arrive in real time in your Reach dashboard.',
  },
];

export default function ReachPage() {
  return (
    <>
      <ModulePageHero
        eyebrow="Reach"
        headline="Market to African customers where they actually are."
        subheadline="Location-aware, multilingual mobile marketing built into the GeoAfric platform. Reach your audience near your stores — in their language, at the right moment."
        accentColor="teal"
        darkHero={false}
      />

      {/* Problem — 2-column */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-teal">The problem</p>
            <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">
              Digital ads don't work the same way in Africa.
            </h2>
          </div>
          <div className="flex items-center">
            <p className="text-base leading-relaxed text-gray-600">
              Meta and Google ads are expensive, language-limited, and disconnected from physical store
              presence. SMS marketing is cheap but has no targeting precision. GeoAfric Reach gives African
              brands a middle path: the contextual relevance of in-store marketing with the scale of digital.
            </p>
          </div>
        </div>
      </section>

      {/* How it works — steps */}
      <section className="bg-[#F0F2F8] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-teal">How it works</p>
          <h2 className="mb-10 font-display text-2xl font-bold text-navy md:text-3xl">
            Running your first campaign takes under 10 minutes.
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map(({ num, title, body }) => (
              <div key={num} className="rounded-2xl border border-gray-200 bg-white p-6">
                <span
                  className="mb-4 block font-display text-3xl font-extrabold"
                  style={{ color: '#00E6D2' }}
                >
                  {num}
                </span>
                <h3 className="mb-2 text-sm font-bold text-navy">{title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-teal">What you get</p>
          <h2 className="mb-10 font-display text-2xl font-bold text-navy md:text-3xl">
            Everything in the Reach toolkit.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-gray-100 bg-[#F8F9FB] p-6">
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(0,230,210,0.10)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: '#00E6D2' }} strokeWidth={1.8} />
                </div>
                <h3 className="mb-2 text-sm font-bold text-navy">{title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI example */}
      <section className="bg-[#080F20] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#00E6D2' }}>
            Real example
          </p>
          <h2 className="mb-8 font-display text-2xl font-bold text-white md:text-3xl">
            A Lagos supermarket chain ran one Reach campaign for ₦150,000.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { stat: '4,200', label: 'users reached within 1 km of stores' },
              { stat: '18%',   label: 'in-store conversion rate (vs 2% industry avg)' },
              { stat: '6.4×',  label: 'return on campaign spend' },
            ].map(({ stat, label }) => (
              <div key={label} className="rounded-2xl border border-white/10 p-6">
                <p
                  className="mb-2 font-display text-4xl font-extrabold"
                  style={{ color: '#00E6D2' }}
                >
                  {stat}
                </p>
                <p className="text-sm text-white/50">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs italic text-white/30">
            Illustrative example. Results vary by market, category, and campaign quality.
          </p>
        </div>
      </section>

      {/* Compliance note */}
      <section className="border-l-4 border-gold bg-amber-50 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gold">Compliance note</p>
          <p className="text-sm leading-relaxed text-gray-700">
            GeoAfric Reach only delivers messages to users who have actively opted in to business
            notifications within the GeoAfric app. We comply with Nigeria's NDPR, Ghana's Data Protection
            Act, and the GDPR as applicable. All campaigns are subject to GeoAfric's content policy review
            before going live.
          </p>
        </div>
      </section>

      <ModulePilotCTA
        module="reach"
        setupPrice="$500 / month"
        monthlyPrice="+ pay-per-reach credits"
        pilotScope="3-month pilot includes onboarding, 5 campaign credits, dedicated campaign manager review, and full analytics access. Pay-per-reach credits top up as you go — no minimum spend after setup."
        additionalNote="Campaign reach depends on GeoAfric user density in your target geography. We'll share a coverage estimate before you commit."
      />

      <ModuleEnquiryFooter defaultModule="reach" />
    </>
  );
}
