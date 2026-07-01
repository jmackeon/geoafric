interface Props {
  module:          string;
  setupPrice:      string;
  monthlyPrice:    string;
  pilotScope:      string;
  additionalNote?: string;
}

export function ModulePilotCTA({ setupPrice, monthlyPrice, pilotScope, additionalNote }: Props) {
  return (
    <section className="bg-[#080F20] px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-green">Pilot scope</p>

        {/* Pricing */}
        <div className="mb-8 flex flex-wrap items-end gap-x-8 gap-y-2">
          <span className="font-display text-5xl font-extrabold text-gold">{setupPrice}</span>
          <span className="mb-1 text-xl font-semibold text-white/60">{monthlyPrice}</span>
        </div>

        {/* Scope */}
        <p className="mb-4 max-w-2xl text-base leading-relaxed text-white/60">{pilotScope}</p>

        {/* Optional note */}
        {additionalNote && (
          <p className="mb-10 text-sm italic text-white/40">{additionalNote}</p>
        )}
        {!additionalNote && <div className="mb-10" />}

        {/* CTA */}
        <a
          href="#enquire"
          className="block w-full rounded-xl bg-gold py-4 text-center text-sm font-bold text-[#080F20] transition-opacity hover:opacity-90 md:w-auto md:inline-block md:px-12"
        >
          Book your free audit
        </a>
      </div>
    </section>
  );
}
