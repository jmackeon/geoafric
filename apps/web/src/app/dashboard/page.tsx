'use client';

import Link from 'next/link';
import {
  MapPin, Heart, Compass, Users, TrendingUp,
  Shield, AlertCircle, ArrowUpRight, Plus,
  CheckCircle2, Zap,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import { useTranslation } from '@/i18n/TranslationProvider';

// ── Adinkra-inspired SVG background for hero ──────────────────────────────────
const AdinkraHero = () => (
  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
    opacity: 0.07, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="adinkra" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        {/* Gye Nyame inspired symbol */}
        <circle cx="40" cy="40" r="16" fill="none" stroke="#F5A623" strokeWidth="1.5"/>
        <circle cx="40" cy="40" r="8"  fill="none" stroke="#F5A623" strokeWidth="1"/>
        <line x1="40" y1="24" x2="40" y2="56" stroke="#F5A623" strokeWidth="1"/>
        <line x1="24" y1="40" x2="56" y2="40" stroke="#F5A623" strokeWidth="1"/>
        <circle cx="40" cy="40" r="3" fill="#F5A623"/>
        {/* Corner dots */}
        <circle cx="4"  cy="4"  r="1.5" fill="#00E6D2"/>
        <circle cx="76" cy="4"  r="1.5" fill="#00E6D2"/>
        <circle cx="4"  cy="76" r="1.5" fill="#00E6D2"/>
        <circle cx="76" cy="76" r="1.5" fill="#00E6D2"/>
        {/* Kente strip */}
        <rect x="0"  y="0" width="80" height="2" fill="#00B67A" opacity="0.5"/>
        <rect x="0" y="78" width="80" height="2" fill="#00B67A" opacity="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#adinkra)"/>
  </svg>
);

// ── Africa mesh network SVG ────────────────────────────────────────────────────
const AfricaMesh = () => (
  <svg viewBox="0 0 240 260" style={{ width: '220px', height: '240px', opacity: 0.12,
    position: 'absolute', right: '-10px', bottom: '-20px', pointerEvents: 'none' }}
    xmlns="http://www.w3.org/2000/svg">
    {/* Africa silhouette */}
    <path fill="#F5A623" d="M120,8 C100,8 86,14 78,24 C66,36 62,46 56,60
      C48,76 42,85 36,100 C30,116 26,130 24,146 C22,162 24,176 30,190
      C36,204 46,212 52,224 C58,236 54,250 62,260
      C70,268 84,272 96,271 C108,270 118,264 128,258
      C140,252 150,248 158,240 C168,230 174,218 178,204
      C182,190 184,176 186,162 C188,146 186,128 180,114
      C174,100 164,90 156,78 C148,66 144,50 136,36 C128,22 124,8 120,8Z"/>
    {/* Network nodes */}
    {[[80,80],[120,60],[160,90],[100,120],[140,140],[80,160],[160,170],[120,200],[95,230]].map(([x,y], i) => (
      <circle key={i} cx={x} cy={y} r="5" fill="#00E6D2" opacity="0.9"/>
    ))}
    {/* Network lines */}
    {[
      [80,80,120,60],[120,60,160,90],[80,80,100,120],[120,60,140,140],
      [160,90,140,140],[100,120,80,160],[100,120,140,140],[140,140,160,170],
      [80,160,120,200],[160,170,120,200],[120,200,95,230],[140,140,120,200],
    ].map(([x1,y1,x2,y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#00E6D2" strokeWidth="1" opacity="0.5"/>
    ))}
    {/* Location pin */}
    <circle cx="120" cy="130" r="10" fill="#F5A623"/>
    <circle cx="120" cy="130" r="4"  fill="#080F20"/>
  </svg>
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const firstName = user?.full_name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('dashboard.goodMorning')
    : hour < 17 ? t('dashboard.goodAfternoon')
    : t('dashboard.goodEvening');

  const STATS = [
    { label: 'Family Members',   value: '—', sub: 'Add members to begin',    icon: Users,   accent: '#F5A623', glow: 'rgba(245,166,35,0.15)'  },
    { label: 'Active Locations', value: '—', sub: 'No live tracking yet',    icon: MapPin,  accent: '#00E6D2', glow: 'rgba(0,230,210,0.15)'   },
    { label: 'Health Score',     value: '—', sub: 'Start monitoring health', icon: Heart,   accent: '#EF4444', glow: 'rgba(239,68,68,0.12)'   },
    { label: 'Places Saved',     value: '—', sub: 'Discover nearby places',  icon: Compass, accent: '#00B67A', glow: 'rgba(0,182,122,0.15)'   },
  ];

  const ACTIONS = [
    { label: 'View Family Map', sub: 'Live location',     icon: MapPin,  href: '/dashboard/location', accent: '#00E6D2' },
    { label: 'Health Monitor',  sub: 'Alerts & insights', icon: Heart,   href: '/dashboard/health',   accent: '#EF4444' },
    { label: 'Discover Places', sub: 'Nearby & saved',    icon: Compass, href: '/dashboard/discover', accent: '#00B67A' },
    { label: 'Invite Family',   sub: 'Add members',       icon: Users,   href: '/dashboard/family',   accent: '#F5A623' },
  ];

  const CHECKLIST = [
    { label: 'Complete your profile',       href: '/dashboard/settings', done: false },
    { label: 'Invite your first member',    href: '/dashboard/family',   done: false },
    { label: 'Enable location sharing',     href: '/dashboard/location', done: false },
    { label: 'Set up a geofence zone',      href: '/dashboard/location', done: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px',
      fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Hero Banner ────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', borderRadius: '28px', overflow: 'hidden', minHeight: '280px',
        background: 'linear-gradient(135deg, #080F20 0%, #0D1B3D 45%, #0A2540 70%, #062F2A 100%)',
        boxShadow: '0 24px 60px rgba(8,15,32,0.4)' }}>

        <AdinkraHero />
        <AfricaMesh />

        {/* Gold top line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, #F5A623 0%, #00B67A 50%, #00E6D2 100%)' }} />

        <div style={{ position: 'relative', padding: '40px 44px', display: 'grid',
          gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'center' }}
          className="hero-grid">

          {/* Left content */}
          <div>
            {/* Status badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '7px 14px', borderRadius: '999px', marginBottom: '20px',
              background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%',
                background: '#00B67A', boxShadow: '0 0 8px rgba(0,182,122,0.8)',
                display: 'inline-block', animation: 'ga-pulse 2s infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
                Platform Live — MVP
              </span>
            </div>

            <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)',
              margin: '0 0 6px', letterSpacing: '0.02em' }}>{greeting},</p>

            <div style={{ margin: '0 0 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, margin: 0,
                  fontFamily: 'Sora, sans-serif', letterSpacing: '-0.04em', lineHeight: 1.05,
                  background: 'linear-gradient(135deg, #ffffff 40%, rgba(245,166,35,0.9) 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {firstName}
                </h1>
                {/* Wave emoji — explicit emoji font stack forces proper colored rendering on Windows */}
                <span style={{
                  fontSize: 'clamp(26px, 3.5vw, 42px)',
                  fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
                  display: 'inline-block',
                  animation: 'ga-wave 2.5s ease-in-out infinite',
                  transformOrigin: '70% 70%',
                  lineHeight: 1,
                }}>&#x1F44B;&#xFE0F;</span>
              </div>
              {/* Gold underline accent */}
              <div style={{ height: '3px', width: '55%', marginTop: '8px',
                background: 'linear-gradient(90deg, #F5A623, #00B67A, transparent)',
                borderRadius: '999px' }} />
            </div>

            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', maxWidth: '480px',
              margin: '0 0 28px', lineHeight: 1.7 }}>
              {t('dashboard.dashboardReady')}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/dashboard/family" style={{ display: 'inline-flex', alignItems: 'center',
                gap: '8px', padding: '13px 22px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #F5A623, #E8960A)',
                color: '#080F20', fontSize: '14px', fontWeight: 800,
                textDecoration: 'none', letterSpacing: '-0.01em',
                boxShadow: '0 8px 24px rgba(245,166,35,0.4)' }}>
                <Plus style={{ width: '16px', height: '16px' }} />
                {t('dashboard.inviteFamily')}
              </Link>
              <Link href="/dashboard/location" style={{ display: 'inline-flex', alignItems: 'center',
                gap: '8px', padding: '13px 22px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
                color: 'white', fontSize: '14px', fontWeight: 600,
                textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                <MapPin style={{ width: '16px', height: '16px', color: '#00E6D2' }} />
                {t('dashboard.viewFamilyMap')}
              </Link>
            </div>
          </div>

          {/* Right — Family Presence widget */}
          <div style={{ minWidth: '260px', maxWidth: '300px', padding: '20px',
            borderRadius: '20px', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
            className="presence-widget">
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'rgba(0,230,210,0.7)',
              margin: '0 0 4px' }}>Family Presence</p>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'white', margin: '0 0 16px' }}>Who's nearby</p>
            {[
              { name: 'Abena M.',    city: 'Kumasi',   mins: 1,  online: true  },
              { name: 'Kofi A.',     city: 'Accra',    mins: 12, online: true  },
              { name: 'Esi T.',      city: 'Takoradi', mins: 45, online: false },
            ].map(({ name, city, mins, online }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '12px', marginBottom: '6px',
                background: online ? 'rgba(0,182,122,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${online ? 'rgba(0,182,122,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '9px',
                  background: online ? 'rgba(0,182,122,0.25)' : 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 800,
                  color: online ? '#00E6D2' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                  {name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, margin: 0,
                    color: online ? 'white' : 'rgba(255,255,255,0.4)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                    📍 {city}
                  </p>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px',
                  borderRadius: '999px', flexShrink: 0,
                  background: online ? 'rgba(0,182,122,0.2)' : 'rgba(255,255,255,0.06)',
                  color: online ? '#00E6D2' : 'rgba(255,255,255,0.25)',
                  border: `1px solid ${online ? 'rgba(0,182,122,0.3)' : 'transparent'}` }}>
                  {mins < 5 ? 'Now' : `${mins}m`}
                </span>
              </div>
            ))}
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)',
              textAlign: 'center', margin: '10px 0 0', letterSpacing: '0.05em' }}>
              Sample — invite family to see live
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}
        className="stats-grid">
        {STATS.map(({ label, value, sub, icon: Icon, accent, glow }) => (
          <div key={label} style={{ background: 'white', borderRadius: '20px', padding: '22px',
            border: '1px solid #E8EBF3', position: 'relative', overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(13,27,61,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(13,27,61,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(13,27,61,0.06)'; }}>
            {/* Glow orb */}
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px',
              height: '80px', borderRadius: '50%', background: glow, pointerEvents: 'none' }} />
            <div style={{ width: '42px', height: '42px', borderRadius: '13px', marginBottom: '16px',
              background: glow, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${accent}30` }}>
              <Icon style={{ width: '20px', height: '20px', color: accent }} />
            </div>
            <p style={{ fontSize: '30px', fontWeight: 900, color: '#0D1B3D', margin: '0 0 2px',
              fontFamily: 'Sora, sans-serif', letterSpacing: '-0.05em' }}>{value}</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3D', margin: '0 0 4px' }}>{label}</p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions + Checklist ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}
        className="main-grid">

        {/* Quick Actions */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '28px',
          border: '1px solid #E8EBF3', boxShadow: '0 4px 24px rgba(13,27,61,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: '#00B67A', margin: '0 0 4px' }}>Start here</p>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0D1B3D', margin: 0,
                fontFamily: 'Sora, sans-serif', letterSpacing: '-0.03em' }}>
                {t('dashboard.quickActions')}
              </h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
            className="actions-grid">
            {ACTIONS.map(({ label, sub, icon: Icon, href, accent }) => (
              <Link key={label} href={href} style={{ position: 'relative', display: 'flex',
                alignItems: 'center', gap: '14px', padding: '18px',
                borderRadius: '18px', background: '#FAFBFD', textDecoration: 'none',
                border: '1px solid #E8EBF3', overflow: 'hidden', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F5F7FF'; e.currentTarget.style.borderColor = accent + '40'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}15`; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FAFBFD'; e.currentTarget.style.borderColor = '#E8EBF3'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                {/* Subtle color wash */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
                  background: `radial-gradient(circle at 0% 50%, ${accent}, transparent 70%)`,
                  pointerEvents: 'none' }} />
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
                  background: accent + '15', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', border: `1px solid ${accent}25`, position: 'relative' }}>
                  <Icon style={{ width: '20px', height: '20px', color: accent }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0D1B3D',
                    margin: '0 0 3px', letterSpacing: '-0.01em' }}>{label}</p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>{sub}</p>
                </div>
                <ArrowUpRight style={{ width: '15px', height: '15px', color: '#D1D5DB',
                  flexShrink: 0, position: 'relative' }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Setup Checklist */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px',
          border: '1px solid #E8EBF3', boxShadow: '0 4px 24px rgba(13,27,61,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px',
              background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp style={{ width: '17px', height: '17px', color: '#F5A623' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0D1B3D', margin: 0,
                fontFamily: 'Sora, sans-serif' }}>{t('dashboard.setupChecklist')}</h3>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0' }}>0 / 4 complete</p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: '6px', borderRadius: '999px', background: '#F3F4F6',
            overflow: 'hidden', marginBottom: '18px' }}>
            <div style={{ width: '0%', height: '100%', borderRadius: '999px',
              background: 'linear-gradient(90deg, #F5A623, #00B67A)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {CHECKLIST.map(({ label, href, done }) => (
              <Link key={label} href={href} style={{ display: 'flex', alignItems: 'center',
                gap: '11px', padding: '12px 14px', borderRadius: '14px',
                background: done ? 'rgba(0,182,122,0.06)' : '#FAFBFD',
                border: `1px solid ${done ? 'rgba(0,182,122,0.2)' : '#E8EBF3'}`,
                textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#F5A623'; e.currentTarget.style.background = 'rgba(245,166,35,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = done ? 'rgba(0,182,122,0.2)' : '#E8EBF3'; e.currentTarget.style.background = done ? 'rgba(0,182,122,0.06)' : '#FAFBFD'; }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: done ? 'none' : '2px solid #D1D5DB',
                  background: done ? '#00B67A' : 'transparent' }}>
                  {done && <CheckCircle2 style={{ width: '14px', height: '14px', color: 'white' }} />}
                </div>
                <span style={{ fontSize: '13px', fontWeight: done ? 600 : 500,
                  color: done ? '#065F46' : '#374151',
                  textDecoration: done ? 'line-through' : 'none' }}>{label}</span>
                <ArrowUpRight style={{ width: '13px', height: '13px', color: '#D1D5DB',
                  marginLeft: 'auto', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── GeoAfric Status strip ───────────────────────────────────────────────── */}
      <div style={{ background: '#080F20', borderRadius: '20px', padding: '16px 24px',
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        border: '1px solid rgba(245,166,35,0.15)',
        boxShadow: '0 8px 32px rgba(8,15,32,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00B67A',
            boxShadow: '0 0 8px rgba(0,182,122,0.8)', animation: 'ga-pulse 2s infinite' }} />
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.05em', fontFamily: 'Sora, sans-serif' }}>GeoAfric Status</span>
        </div>
        <div style={{ width: '1px', height: '20px', background: 'rgba(245,166,35,0.2)' }} />
        {[
          { label: 'Plan',     value: 'Free Plan', color: '#F5A623' },
          { label: 'Safety',   value: 'Active',    color: '#00B67A' },
          { label: 'AI Health',value: 'Active',    color: '#00B67A' },
          { label: 'GPS',      value: 'Ready',     color: '#00E6D2' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '999px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color }}>{value}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00B67A' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#00B67A' }}>All systems operational</span>
        </div>
      </div>

      {/* Phase notice */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '18px 20px',
        borderRadius: '18px', background: 'linear-gradient(135deg, #FFF9EE, #FFF5E0)',
        border: '1px solid rgba(245,166,35,0.25)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(245,166,35,0.15)' }}>
          <AlertCircle style={{ width: '17px', height: '17px', color: '#D97706' }} />
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#92400E', margin: '0 0 3px' }}>
            {t('dashboard.phase1Notice')}
          </p>
          <p style={{ fontSize: '12px', color: '#B45309', margin: 0, lineHeight: 1.6 }}>
            {t('dashboard.phase1Desc')}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes ga-pulse {
          0%, 100% { box-shadow: 0 0 6px rgba(0,182,122,0.6); opacity: 1; }
          50% { box-shadow: 0 0 14px rgba(0,182,122,0.9); opacity: 0.8; }
        }
        @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 900px)  { .main-grid { grid-template-columns: 1fr !important; } .hero-grid { grid-template-columns: 1fr !important; } .presence-widget { display: none !important; } }
        @media (max-width: 600px)  { .stats-grid, .actions-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}