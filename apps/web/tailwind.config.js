/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // ── GeoAfric Official Brand Colors ──────────────────────────────────
        navy: {
          DEFAULT: '#0D1B3D',
          50:  '#E8EBF3',
          100: '#C5CCE2',
          200: '#9AAACF',
          300: '#7088BB',
          400: '#506FAD',
          500: '#2F579F',
          600: '#264891',
          700: '#1A3578',
          800: '#0D1B3D',   // Deep Blue — primary brand
          900: '#080F22',
        },
        green: {
          DEFAULT: '#00B67A',
          50:  '#E0F7EF',
          100: '#B3EDD8',
          200: '#80E2BE',
          300: '#4DD7A4',
          400: '#26CE90',
          500: '#00B67A',   // Emerald Green — "Afric" text, accents
          600: '#009966',
          700: '#007A52',
          800: '#005C3D',
          900: '#003D29',
        },
        gold: {
          DEFAULT: '#F5A623',
          50:  '#FEF5E7',
          100: '#FCE5BF',
          200: '#FAD392',
          300: '#F8C165',
          400: '#F7B343',
          500: '#F5A623',   // Warm Gold — CTA buttons, "Discover"
          600: '#D48A0A',
          700: '#A86C08',
          800: '#7C4F06',
          900: '#503304',
        },
        teal: {
          DEFAULT: '#00E6D2',
          50:  '#E0FDFB',
          100: '#B3FAF5',
          200: '#80F7EE',
          300: '#4DF3E7',
          400: '#26F0E0',
          500: '#00E6D2',   // Neon Teal — "Track", highlights
          600: '#00BFB0',
          700: '#009990',
          800: '#007370',
          900: '#004D4A',
        },
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0D1B3D 0%, #0D2B5E 50%, #0D1B3D 100%)',
        'gold-gradient':  'linear-gradient(135deg, #F5A623 0%, #F8C165 100%)',
        'green-gradient': 'linear-gradient(135deg, #00B67A 0%, #00E6D2 100%)',
      },
      boxShadow: {
        'glow-gold':  '0 0 24px rgba(245, 166, 35, 0.4)',
        'glow-green': '0 0 24px rgba(0, 182, 122, 0.4)',
        'glow-teal':  '0 0 24px rgba(0, 230, 210, 0.3)',
        'card':       '0 4px 24px rgba(13, 27, 61, 0.08)',
        'card-hover': '0 8px 40px rgba(13, 27, 61, 0.16)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 8px rgba(245,166,35,0.3)' }, '50%': { boxShadow: '0 0 24px rgba(245,166,35,0.7)' } },
        float:     { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
};