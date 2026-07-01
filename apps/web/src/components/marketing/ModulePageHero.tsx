type AccentColor = 'emerald' | 'gold' | 'teal' | 'navy';

interface Props {
  eyebrow:      string;
  headline:     string;
  subheadline:  string;
  accentColor:  AccentColor;
  darkHero?:    boolean;
}

const ACCENT: Record<AccentColor, { text: string; dot: string; border: string; bgRgba: string }> = {
  emerald: { text: 'text-green', dot: 'bg-green', border: 'border-green/40', bgRgba: 'rgba(0,182,122,0.08)'  },
  gold:    { text: 'text-gold',  dot: 'bg-gold',  border: 'border-gold/40',  bgRgba: 'rgba(245,166,35,0.08)' },
  teal:    { text: 'text-teal',  dot: 'bg-teal',  border: 'border-teal/40',  bgRgba: 'rgba(0,230,210,0.08)' },
  navy:    { text: 'text-navy',  dot: 'bg-navy',  border: 'border-navy/40',  bgRgba: 'rgba(13,27,61,0.08)'  },
};

export function ModulePageHero({ eyebrow, headline, subheadline, accentColor, darkHero = false }: Props) {
  const accent = ACCENT[accentColor];

  return (
    <section
      className="px-6 pb-20 pt-20"
      style={{ backgroundColor: darkHero ? '#080F20' : '#F8F9FB' }}
    >
      <div className="mx-auto max-w-4xl">

        {/* Eyebrow pill */}
        <div
          className={`mb-8 inline-flex items-center gap-2 rounded-full border ${accent.border} px-4 py-1.5`}
          style={{ background: accent.bgRgba }}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${accent.text}`}>{eyebrow}</span>
        </div>

        {/* Headline */}
        <h1
          className="mb-6 font-display text-5xl font-extrabold leading-[1.1] md:text-6xl"
          style={{ color: darkHero ? '#ffffff' : '#080F20' }}
        >
          {headline}
        </h1>

        {/* Subheadline */}
        <p
          className="max-w-2xl text-lg leading-relaxed md:text-xl"
          style={{ color: darkHero ? 'rgba(255,255,255,0.6)' : '#4B5563' }}
        >
          {subheadline}
        </p>
      </div>
    </section>
  );
}
