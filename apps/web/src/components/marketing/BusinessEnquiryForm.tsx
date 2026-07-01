'use client';

import { useState } from 'react';

const COUNTRIES = ['Nigeria', 'Ghana', 'Ivory Coast', 'Kenya', 'South Africa', 'Other'];

const MODULE_OPTIONS = [
  { value: 'enterprise',  label: 'Enterprise Suite'                      },
  { value: 'logistics',   label: 'Logistics & Fleet'                     },
  { value: 'reach',       label: 'Reach'                                 },
  { value: 'hospitality', label: 'Hospitality'                           },
  { value: 'unsure',      label: "Not sure — help me find the right fit" },
];

type Status = 'idle' | 'submitting' | 'success' | 'error';

const INPUT =
  'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-navy placeholder-gray-400 ' +
  'focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-colors bg-white';

export function BusinessEnquiryForm({ defaultModule }: { defaultModule?: string }) {
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({
    name:    '',
    company: '',
    country: '',
    module:  defaultModule ?? '',
    phone:   '',
    message: '',
  });

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res  = await fetch('/api/enquiry', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? 'Failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <section id="enquire" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-green/20 bg-green/5 p-12 text-center">
            <span className="mb-4 block text-4xl">✅</span>
            <h3 className="mb-2 font-display text-2xl font-bold text-navy">Enquiry received</h3>
            <p className="text-gray-500">
              Thanks — we'll be in touch within one business day.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="enquire" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-green">Get in touch</p>
        <h2 className="mb-2 font-display text-3xl font-bold text-navy md:text-4xl">
          Tell us about your business.
        </h2>
        <p className="mb-12 text-gray-500">
          We'll respond within one business day to schedule your free audit.
        </p>

        {status === 'error' && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Something went wrong. Please email us directly at{' '}
            <a href="mailto:info@alphaztechnologies.com" className="font-semibold underline">
              info@alphaztechnologies.com
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Name + Company */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Full name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={set('name')}
                placeholder="James Mackeon"
                className={INPUT}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Company / organisation *
              </label>
              <input
                type="text"
                required
                value={form.company}
                onChange={set('company')}
                placeholder="Alpha-Z Technologies"
                className={INPUT}
              />
            </div>
          </div>

          {/* Country + Module */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Country *
              </label>
              <select required value={form.country} onChange={set('country')} className={INPUT}>
                <option value="" disabled>Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Module of interest *
              </label>
              <select required value={form.module} onChange={set('module')} className={INPUT}>
                <option value="" disabled>Select a module</option>
                {MODULE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Phone number *
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={set('phone')}
              placeholder="+234 800 000 0000"
              className={INPUT}
            />
          </div>

          {/* Message */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Message / describe your problem
            </label>
            <textarea
              rows={5}
              value={form.message}
              onChange={set('message')}
              placeholder="e.g. We manage a fleet of 40 vehicles and have no real-time visibility..."
              className={`${INPUT} resize-none`}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-4 text-sm font-bold text-[#080F20] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {status === 'submitting' && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Or email us directly at{' '}
            <a
              href="mailto:info@alphaztechnologies.com"
              className="font-semibold text-navy hover:underline"
            >
              info@alphaztechnologies.com
            </a>
          </p>
        </form>
      </div>
    </section>
  );
}
