import type { Metadata } from 'next';
import type { ElementType } from 'react';
import { MapPin, Bell, Users, Star, Wifi, MessageSquare } from 'lucide-react';
import { ModulePageHero } from '@/components/marketing/ModulePageHero';
import { ModulePilotCTA } from '@/components/marketing/ModulePilotCTA';
import { ModuleEnquiryFooter } from '@/components/marketing/ModuleEnquiryFooter';

export const metadata: Metadata = {
  title: 'Hospitality — GeoAfric for Business',
  description:
    'Guest safety, concierge discovery, and property management tools for African hotels, resorts, and travel operators.',
};

const FEATURES = [
  {
    icon: MapPin,
    title: 'Guest location sharing',
    body:  'Allow guests to share their location with the property for watersports, safari excursions, and remote beach access — with one-tap deactivation.',
  },
  {
    icon: Bell,
    title: 'Emergency SOS for guests',
    body:  'Every guest gets a panic button. Alerts go directly to your security desk and the local emergency contact you register — no app download required for international guests.',
  },
  {
    icon: Star,
    title: 'Curated place discovery',
    body:  'Surface your partner restaurants, tour operators, and local experiences directly in the GeoAfric app. Guests discover your curated list before asking the front desk.',
  },
  {
    icon: Users,
    title: 'Group family tracking',
    body:  'Family resorts can offer parents a shared family map. Track children between pool, beach, and kids club without constant radio check-ins.',
  },
  {
    icon: Wifi,
    title: 'Low-bandwidth optimised',
    body:  'GeoAfric operates on 2G/EDGE. Guests with limited data still get full location and SOS functionality — critical for bush lodges and island resorts.',
  },
  {
    icon: MessageSquare,
    title: 'Property notifications',
    body:  'Push housekeeping updates, activity reminders, and check-out instructions directly via the GeoAfric in-app channel. No WhatsApp group management.',
  },
];

const WHO = [
  'Beach and island resorts',
  'Safari lodges and game reserves',
  'City business hotels',
  'All-inclusive family resorts',
  'Eco-lodges and retreat centres',
  'Tour operators managing group travel',
];

export default function HospitalityPage() {
  return (
    <>
      <ModulePageHero
        eyebrow="Hospitality"
        headline="Guest safety and discovery — built for African hospitality."
        subheadline="Give your guests a safer, richer experience with location sharing, emergency SOS, and curated local discovery — without building your own app."
        accentColor="gold"
        darkHero={false}
      />

      {/* Problem */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gold">The problem</p>
          <h2 className="mb-6 font-display text-3xl font-bold text-navy md:text-4xl">
            African hospitality operators carry outsized safety risk with limited tools.
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-gray-600">
            International guests at African properties expect the same safety standards as European resorts —
            but the infrastructure isn't there. Walkie-talkies, WhatsApp groups, and front-desk calls don't
            scale during busy season and fail entirely during emergencies. GeoAfric Hospitality gives
            properties a guest safety layer that works on African connectivity, without requiring guests to
            install a custom-branded app.
          </p>
        </div>
      </section>

      {/* Who */}
      <section className="bg-[#F0F2F8] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gold">Who it's for</p>
          <h2 className="mb-10 font-display text-2xl font-bold text-navy md:text-3xl">
            Any property where guests leave the building.
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {WHO.map(item => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-5"
              >
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                <span className="text-sm font-medium text-navy">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gold">What you get</p>
          <h2 className="mb-10 font-display text-2xl font-bold text-navy md:text-3xl">
            The full Hospitality toolkit.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {FEATURES.map(({ icon, title, body }) => {
              const Icon = icon as unknown as ElementType;
              return (
                <div key={title} className="rounded-2xl border border-gray-100 bg-[#F8F9FB] p-6">
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(245,166,35,0.10)' }}
                  >
                    <Icon className="h-5 w-5 text-gold" strokeWidth={1.8} />
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-navy">{title}</h3>
                  <p className="text-xs leading-relaxed text-gray-500">{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Honest note */}
      <section className="bg-[#F0F2F8] px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gold/20 bg-white p-8" style={{ borderLeftWidth: 4, borderLeftColor: '#F5A623' }}>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold">Honest note</p>
            <p className="max-w-2xl text-sm leading-relaxed text-gray-600">
              GeoAfric Hospitality is a module on a consumer safety platform — not a full-blown hotel PMS or
              property management system. It won't replace your booking software, POS, or housekeeping rosters.
              What it does replace: the WhatsApp SOS group that falls apart during an actual emergency, and the
              "I don't know where our guests are on the beach" problem that no current tool solves affordably.
              If that's the specific problem you're solving, we're a great fit. If you need a full PMS, we'll
              tell you so on the call.
            </p>
          </div>
        </div>
      </section>

      <ModulePilotCTA
        module="hospitality"
        setupPrice="$5,000 setup"
        monthlyPrice="+ $500–$1,000 / month"
        pilotScope="3-month pilot covering one property. Includes guest onboarding flow, branded in-app presence, safety protocol setup, and staff training session. Invoicing available in NGN, GHS, or USD."
        additionalNote="Pilot pricing is indicative. Final scope depends on property size and feature requirements confirmed on the scoping call."
      />

      <ModuleEnquiryFooter defaultModule="hospitality" />
    </>
  );
}
