import type { Metadata } from 'next';
import type { ElementType } from 'react';
import { Shield, Users, MapPin, BarChart2, Bell, Lock } from 'lucide-react';
import { ModulePageHero } from '@/components/marketing/ModulePageHero';
import { ModulePilotCTA } from '@/components/marketing/ModulePilotCTA';
import { ModuleEnquiryFooter } from '@/components/marketing/ModuleEnquiryFooter';

export const metadata: Metadata = {
  title: 'Enterprise Suite — GeoAfric for Business',
  description:
    'Safety, health, and location intelligence for Africa\'s enterprise workforce. From field teams to executive offices.',
};

const FEATURES = [
  {
    icon: MapPin,
    title: 'Live workforce maps',
    body:  'See every employee, field agent, or contractor on a real-time map — clustered by department, site, or region.',
  },
  {
    icon: Shield,
    title: 'Duty-of-care SOS',
    body:  'One-tap panic button with auto-escalation. Alert managers and designated contacts the moment an employee triggers an SOS.',
  },
  {
    icon: Bell,
    title: 'Geofence automation',
    body:  'Set site boundaries. Receive instant alerts when staff enter, exit, or linger outside expected zones — no manual checking.',
  },
  {
    icon: BarChart2,
    title: 'Health & attendance dashboard',
    body:  'Aggregate anonymised health signals across your workforce. Spot burnout, attendance drops, and wellness trends early.',
  },
  {
    icon: Lock,
    title: 'Role-based access control',
    body:  'HR sees workforce health. Line managers see their teams. Executives see the overview. Data stays within its lane.',
  },
  {
    icon: Users,
    title: 'Unlimited seats',
    body:  'Add as many employees as your organisation needs. Pricing is by feature scope, not per-seat headcount.',
  },
];

const WHO = [
  'Banks & financial institutions',
  'Telecoms & utilities',
  'Healthcare networks & hospital groups',
  'Manufacturing & industrial operations',
  'Government agencies & NGOs',
  'Mining & extractive industries',
];

export default function EnterprisePage() {
  return (
    <>
      <ModulePageHero
        eyebrow="Enterprise Suite"
        headline="Your workforce, visible and safe — across every site in Africa."
        subheadline="Location intelligence, duty-of-care SOS, geofencing, and health monitoring — unified in one dashboard for HR, security, and operations teams."
        accentColor="emerald"
        darkHero={false}
      />

      {/* Problem */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-green">The problem</p>
          <h2 className="mb-6 font-display text-3xl font-bold text-navy md:text-4xl">
            Enterprise HR tools weren&apos;t built for African conditions.
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-gray-600">
            Western workforce platforms assume stable connectivity, static office environments, and homogeneous
            geography. African enterprises operate across poor network coverage, distributed field teams, high-risk
            zones, and multi-country jurisdictions — none of which traditional tools were designed for.
            GeoAfric Enterprise was.
          </p>
        </div>
      </section>

      {/* Who */}
      <section className="bg-[#F0F2F8] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-green">Who it&apos;s for</p>
          <h2 className="mb-10 font-display text-2xl font-bold text-navy md:text-3xl">
            Built for Africa&apos;s largest employers.
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {WHO.map(item => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-5"
              >
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-green" />
                <span className="text-sm font-medium text-navy">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features 2×3 */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-green">What you get</p>
          <h2 className="mb-10 font-display text-2xl font-bold text-navy md:text-3xl">
            Every tool your operations team needs.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {FEATURES.map(({ icon, title, body }) => {
              const Icon = icon as unknown as ElementType;
              return (
                <div
                  key={title}
                  className="rounded-2xl border border-gray-100 bg-[#F8F9FB] p-6"
                >
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

      <ModulePilotCTA
        module="enterprise"
        setupPrice="$5,000 setup"
        monthlyPrice="+ $1,000–$2,500 / month"
        pilotScope="3-month pilot covering up to 500 employees. Includes integration with your HR system, onboarding workshops, and a dedicated account manager. Quoted in USD for international procurement clarity — NGN/GHS/XOF invoicing available."
        additionalNote="Pricing is indicative and subject to final scoping call with our enterprise team."
      />

      <ModuleEnquiryFooter defaultModule="enterprise" />
    </>
  );
}
