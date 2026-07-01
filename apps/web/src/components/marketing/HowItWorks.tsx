const STEPS = [
  {
    number: '01',
    title:  'Free audit',
    desc:   'We meet, listen, and map your biggest operational problem. No charge, no commitment.',
    numColor:   'text-green',
    borderColor: 'border-green/30',
    bgColor:     'bg-green/10',
  },
  {
    number: '02',
    title:  'Scoped pilot',
    desc:   'We deploy the right module for your business in 4–8 weeks. You see results before you subscribe.',
    numColor:   'text-gold',
    borderColor: 'border-gold/30',
    bgColor:     'bg-gold/10',
  },
  {
    number: '03',
    title:  'Managed subscription',
    desc:   'Convert to a monthly subscription. We handle support, updates, and growth.',
    numColor:   'text-teal',
    borderColor: 'border-teal/30',
    bgColor:     'bg-teal/10',
  },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-green">How it works</p>
        <h2 className="mb-14 font-display text-3xl font-bold text-navy md:text-4xl">
          Audit. Pilot. Scale.
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map(({ number, title, desc, numColor, borderColor, bgColor }) => (
            <div
              key={number}
              className={`rounded-2xl border ${borderColor} ${bgColor} p-8`}
            >
              <p className={`mb-4 font-display text-5xl font-extrabold ${numColor}`}>{number}</p>
              <h3 className="mb-3 font-display text-xl font-bold text-navy">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-[12px] text-gray-400">
          Pilot pricing from $5,000 setup + $500–$2,500/month. Quoted in USD for international clarity.
        </p>
      </div>
    </section>
  );
}
