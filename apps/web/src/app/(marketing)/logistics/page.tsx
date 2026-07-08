import type { Metadata } from 'next';
import type { ElementType } from 'react';
import { Truck, MapPin, Bell, BarChart2, Clock, Fuel } from 'lucide-react';
import { ModulePageHero } from '@/components/marketing/ModulePageHero';
import { ModulePilotCTA } from '@/components/marketing/ModulePilotCTA';
import { ModuleEnquiryFooter } from '@/components/marketing/ModuleEnquiryFooter';

export const metadata: Metadata = {
  title: 'Logistics & Fleet — GeoAfric for Business',
  description:
    'Real-time fleet visibility, driver safety, and route intelligence for African logistics operators.',
};

const FEATURES = [
  {
    icon: MapPin,
    title: 'Live vehicle tracking',
    body:  'Every vehicle on a single map. Updated in near real-time even on low-bandwidth networks. Drill in by depot, route, or driver.',
  },
  {
    icon: Bell,
    title: 'Geofence alerts',
    body:  'Draw zones around depots, customer sites, and no-go areas. Get notified the moment a vehicle crosses a boundary — automatically.',
  },
  {
    icon: Clock,
    title: 'Route history & replay',
    body:  'Replay any vehicle\'s full day route. Verify delivery times, investigate incidents, or defend against false claims.',
  },
  {
    icon: Truck,
    title: 'Driver safety scoring',
    body:  'Detect harsh braking, speeding, and long idle. Score drivers weekly. Reward safe behaviour; coach risky ones.',
  },
  {
    icon: Fuel,
    title: 'Fuel consumption analytics',
    body:  'Correlate fuel card data with GPS mileage. Surface anomalies that suggest siphoning, detours, or inefficient routes.',
  },
  {
    icon: BarChart2,
    title: 'Fleet performance reports',
    body:  'Automated weekly and monthly reports on utilisation, idling time, on-time delivery rate, and cost per km. Exportable to Excel.',
  },
];

const SECTORS = [
  { name: 'Last-mile delivery',    description: 'E-commerce, FMCG, and pharmaceutical last-mile across urban and peri-urban areas.' },
  { name: 'Long-haul trucking',    description: 'Cross-border freight on West and East African trade corridors.' },
  { name: 'Ride-hailing fleets',   description: 'Operator oversight for driver fleets beyond what the OEM app provides.' },
  { name: 'School & staff buses',  description: 'Parent-facing live tracking plus duty-of-care compliance for school operators.' },
  { name: 'Government vehicles',   description: 'Public fleet accountability with tamper-evident audit trails.' },
  { name: 'Cold chain logistics',  description: 'Route efficiency for temperature-sensitive cargo — vaccines, produce, dairy.' },
];

export default function LogisticsPage() {
  return (
    <>
      <ModulePageHero
        eyebrow="Logistics & Fleet"
        headline="Every vehicle accounted for. Every delivery verified."
        subheadline="Real-time fleet tracking, driver safety scoring, and route intelligence designed for African roads — not European motorways."
        accentColor="emerald"
        darkHero={true}
      />

      {/* Problem */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-green">The problem</p>
          <h2 className="mb-6 font-display text-3xl font-bold text-navy md:text-4xl">
            African fleet operators are flying blind.
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-gray-600">
            Fuel theft, unauthorised detours, unreliable drivers, and zero delivery confirmation — most fleet
            operators in Nigeria, Ghana, and Ivory Coast manage their vehicles by phone call. Expensive
            European telematics platforms either don&apos;t work on local mobile networks or price small operators
            out entirely. GeoAfric Logistics is built for local conditions from day one.
          </p>
        </div>
      </section>

      {/* Sectors */}
      <section className="bg-[#F0F2F8] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-green">Sectors we serve</p>
          <h2 className="mb-10 font-display text-2xl font-bold text-navy md:text-3xl">
            Any fleet. Any cargo. Any road.
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {SECTORS.map(({ name, description }) => (
              <div key={name} className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="mb-2 text-sm font-bold text-navy">{name}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-green">What you get</p>
          <h2 className="mb-10 font-display text-2xl font-bold text-navy md:text-3xl">
            Everything a fleet manager needs. Nothing they don&apos;t.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {FEATURES.map(({ icon, title, body }) => {
              const Icon = icon as unknown as ElementType;
              return (
                <div key={title} className="rounded-2xl border border-gray-100 bg-[#F8F9FB] p-6">
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(0,182,122,0.10)' }}
                  >
                    <Icon className="h-5 w-5 text-green" strokeWidth={1.8} />
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-navy">{title}</h3>
                  <p className="text-xs leading-relaxed text-gray-500">{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Africa road network SVG */}
      <section className="overflow-hidden bg-[#080F20] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-green">Coverage</p>
          <h2 className="mb-6 font-display text-2xl font-bold text-white md:text-3xl">
            West Africa&apos;s major corridors — tracked natively.
          </h2>
          <p className="mb-10 max-w-xl text-sm leading-relaxed text-white/50">
            Optimised for the Lagos–Abidjan corridor, Accra–Kumasi–Tamale route, and Abidjan–Ouagadougou
            highway. Built to handle EDGE/2G network gaps without losing telemetry.
          </p>
          {/* Schematic road network SVG */}
          <svg
            viewBox="0 0 600 260"
            className="w-full opacity-60"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Major corridor — Lagos to Abidjan */}
            <polyline points="480,130 420,140 360,150 300,145 240,140 180,135 120,130" fill="none" stroke="#00B67A" strokeWidth="2.5" strokeLinecap="round" />
            {/* Branch — Accra to Kumasi */}
            <polyline points="340,145 330,110 310,80 290,60" fill="none" stroke="#00B67A" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="6 4" />
            {/* Branch — Lagos north */}
            <polyline points="480,130 490,100 500,70 495,40" fill="none" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="6 4" />
            {/* Branch — Abidjan north */}
            <polyline points="120,130 110,100 105,70" fill="none" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="6 4" />
            {/* City dots */}
            {[
              { cx: 480, cy: 130, label: 'Lagos',   color: '#00B67A' },
              { cx: 340, cy: 145, label: 'Accra',   color: '#00B67A' },
              { cx: 240, cy: 140, label: 'Lomé',    color: '#00E6D2' },
              { cx: 120, cy: 130, label: 'Abidjan', color: '#00B67A' },
              { cx: 290, cy:  60, label: 'Kumasi',  color: '#F5A623' },
            ].map(({ cx, cy, label, color }) => (
              <g key={label}>
                <circle cx={cx} cy={cy} r="5" fill={color} opacity="0.9" />
                <circle cx={cx} cy={cy} r="10" fill={color} opacity="0.15" />
                <text x={cx} y={cy - 14} textAnchor="middle" fill="white" fontSize="11" fontFamily="DM Sans, sans-serif" opacity="0.7">{label}</text>
              </g>
            ))}
          </svg>
        </div>
      </section>

      <ModulePilotCTA
        module="logistics"
        setupPrice="$5,000 setup"
        monthlyPrice="+ $500–$1,500 / month"
        pilotScope="3-month pilot covering up to 50 vehicles. Includes hardware sourcing guidance, SIM provisioning, dispatcher training, and custom report templates. Pricing in USD — local currency invoicing available."
        additionalNote="Pricing is indicative. Final scope depends on fleet size, geographic coverage, and hardware chosen."
      />

      <ModuleEnquiryFooter defaultModule="logistics" />
    </>
  );
}
