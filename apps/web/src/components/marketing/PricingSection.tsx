'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

export type Currency = 'NGN' | 'GHS' | 'XOF' | 'USD';

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'NGN', label: '🇳🇬 Naira (₦)'  },
  { value: 'GHS', label: '🇬🇭 Cedi (GH₵)' },
  { value: 'XOF', label: '🇨🇮 CFA (XOF)'  },
  { value: 'USD', label: '🌍 USD ($)'      },
];

// TODO: Confirm final pricing with team before launch
const PRICES: Record<Currency, { free: string; personal: string; family: string }> = {
  NGN: { free: '₦0',     personal: '₦2,500',    family: '₦5,000'    },
  GHS: { free: 'GH₵0',  personal: 'GH₵35',     family: 'GH₵70'     },
  XOF: { free: 'XOF 0', personal: 'XOF 4,500',  family: 'XOF 9,000' },
  USD: { free: '$0',     personal: '$2',         family: '$4'         },
};

type PriceKey = 'free' | 'personal' | 'family';
type CtaStyle = 'green' | 'navy' | 'border';

interface Plan {
  id:       string;
  name:     string;
  desc:     string;
  priceKey: PriceKey | null;
  period:   string | null;
  features: string[];
  cta:      string;
  href:     string;
  featured: boolean;
  ctaStyle: CtaStyle;
}

const PLANS: Plan[] = [
  {
    id:       'free',
    name:     'Free',
    desc:     'For individuals getting started',
    priceKey: 'free',
    period:   'forever',
    features: ['1 member', 'Basic location tracking', 'Emergency SOS', 'Place discovery'],
    cta:      'Get started',
    href:     '/auth/register',
    featured: false,
    ctaStyle: 'border',
  },
  {
    id:       'personal',
    name:     'Personal',
    desc:     'For individuals & couples',
    priceKey: 'personal',
    period:   'per month',
    features: ['1 member + 1 guest', 'Real-time tracking', 'Health monitoring', 'Geofence alerts'],
    cta:      'Get started',
    href:     '/auth/register',
    featured: false,
    ctaStyle: 'border',
  },
  {
    id:       'family',
    name:     'Family',
    desc:     'Most popular for families',
    priceKey: 'family',
    period:   'per month',
    features: ['Up to 6 members', 'All Personal features', '8 African languages', 'Priority support'],
    cta:      'Get started',
    href:     '/auth/register',
    featured: true,
    ctaStyle: 'green',
  },
  {
    id:       'business',
    name:     'Business',
    desc:     'For enterprises & teams',
    priceKey: null,
    period:   null,
    features: [
      'All B2B modules',
      'Dedicated account manager',
      'In-country deployment',
      'SLA documentation',
    ],
    cta:      'Book a pilot',
    href:     '/enterprise',
    featured: false,
    ctaStyle: 'navy',
  },
];

const PAYMENT_METHODS = ['MTN MoMo', 'OPay', 'Airtel Money', 'Bank transfer', 'Card'];

export function PricingSection({ defaultCurrency }: { defaultCurrency: Currency }) {
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);

  return (
    <section id="pricing" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-green">Pricing</p>
            <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">
              Simple, transparent pricing.
            </h2>
          </div>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value as Currency)}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-green/30"
          >
            {CURRENCY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map(plan => {
            const price = plan.priceKey ? PRICES[currency][plan.priceKey] : 'Custom';
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border-2 bg-white p-7 shadow-card transition-shadow hover:shadow-card-hover ${
                  plan.featured ? 'border-green' : 'border-gray-100'
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-green px-4 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}

                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{plan.name}</p>
                <p className="mt-1 text-sm text-gray-500">{plan.desc}</p>

                <div className="mb-6 mt-5">
                  <span className="font-display text-3xl font-extrabold text-navy">{price}</span>
                  {plan.period && (
                    <span className="ml-1.5 text-sm text-gray-400">/ {plan.period}</span>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block rounded-xl py-3 text-center text-sm font-bold transition-opacity hover:opacity-90 ${
                    plan.ctaStyle === 'green'  ? 'bg-green text-white'                       :
                    plan.ctaStyle === 'navy'   ? 'bg-navy text-white'                        :
                                                 'border border-gray-200 text-navy hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Payment methods */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-400">Pay with</span>
          {PAYMENT_METHODS.map(m => (
            <span
              key={m}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600"
            >
              {m}
            </span>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-[11px] italic text-gray-400">
          Pricing shown is indicative. Your team will confirm final rates before launch.
        </p>
      </div>
    </section>
  );
}
