'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, MapPin, Heart, Compass, Zap,
  Users, Settings, Bell, LogOut, Menu, X, ChevronRight, CreditCard,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import { useTranslation } from '@/i18n/TranslationProvider';

const KentePattern = () => (
  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}
    xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="kente" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect x="0" y="0"  width="40" height="8"  fill="#F5A623" />
        <rect x="0" y="16" width="40" height="4"  fill="#00E6D2" />
        <rect x="0" y="28" width="40" height="8"  fill="#00B67A" />
        <rect x="0"  y="0" width="4"  height="40" fill="#F5A623" />
        <rect x="18" y="0" width="2"  height="40" fill="#00E6D2" />
        <rect x="34" y="0" width="4"  height="40" fill="#00B67A" />
        <polygon points="20,8 28,16 20,24 12,16" fill="#F5A623" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#kente)" />
  </svg>
);

const AfricaSilhouette = () => (
  <svg viewBox="0 0 200 220" style={{ width: '180px', height: '200px', opacity: 0.04,
    position: 'absolute', bottom: '-20px', right: '-20px', pointerEvents: 'none' }}
    xmlns="http://www.w3.org/2000/svg">
    <path fill="#F5A623" d="M100,5 C85,5 72,10 65,18 C55,28 52,35 48,42 C40,55 35,60 30,72
      C25,84 22,95 20,108 C18,122 20,132 25,142 C30,152 38,158 42,168 C46,178 44,190 50,200
      C56,210 68,215 78,215 C88,215 95,210 102,205 C110,200 118,198 126,192
      C134,186 140,178 145,168 C150,158 152,148 155,138 C158,128 162,118 162,108
      C162,95 158,82 152,72 C146,62 138,55 132,45 C126,35 124,25 118,16 C112,8 106,5 100,5Z"/>
  </svg>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NAV = [
    { href: '/dashboard',          icon: Home,       label: 'Home'                              },
    { href: '/dashboard/location', icon: MapPin,     label: t('dashboard.location')             },
    { href: '/dashboard/health',   icon: Heart,      label: t('dashboard.health')               },
    { href: '/dashboard/discover', icon: Compass,    label: t('dashboard.discover')             },
    { href: '/dashboard/solar',    icon: Zap,        label: t('dashboard.solarTrack') },
    { href: '/dashboard/family',   icon: Users,      label: t('dashboard.family')               },
    { href: '/dashboard/billing',  icon: CreditCard, label: 'Billing'                           },
    { href: '/dashboard/settings', icon: Settings,   label: t('dashboard.settings')             },
  ];

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'G';

  const currentPage = NAV.find(n =>
    pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href))
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F0F2F8',
      fontFamily: 'DM Sans, sans-serif' }}>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="ga-mobile-overlay"
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(13,27,61,0.7)' }} />
      )}

      {/* Sidebar */}
      <aside className={`ga-sidebar${sidebarOpen ? ' open' : ''}`}
        style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column',
          background: '#080F20', height: '100vh', position: 'relative', zIndex: 50, overflowY: 'auto', overflowX: 'hidden' }}>

        <KentePattern />
        <AfricaSilhouette />

        {/* Gold top line */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #F5A623, #00B67A, #00E6D2)',
          flexShrink: 0, position: 'relative', zIndex: 1 }} />

        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(245,166,35,0.12)',
          position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/brand/logo-icon.png" alt="GeoAfric"
                style={{ width: '38px', height: '38px', objectFit: 'contain' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div>
                <p style={{ margin: 0, fontFamily: 'Sora, sans-serif', fontWeight: 900,
                  fontSize: '18px', letterSpacing: '-0.03em',
                  background: 'linear-gradient(90deg, #ffffff 0%, #F5A623 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  GeoAfric
                </p>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 600,
                  letterSpacing: '0.15em', textTransform: 'uppercase', color: '#00E6D2' }}>
                  Dashboard
                </p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ga-sidebar-close"
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>

        {/* Nav label */}
        <div style={{ padding: '20px 20px 8px', position: 'relative', zIndex: 1 }}>
          <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(245,166,35,0.5)' }}>Navigation</p>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0 12px 12px', display: 'flex', flexDirection: 'column',
          gap: '2px', position: 'relative', zIndex: 1 }}>
          {NAV.map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '11px',
                  padding: '10px 14px', borderRadius: '12px', textDecoration: 'none',
                  position: 'relative', overflow: 'hidden',
                  background: active ? 'linear-gradient(135deg, rgba(245,166,35,0.2), rgba(245,166,35,0.08))' : 'transparent',
                  border: active ? '1px solid rgba(245,166,35,0.25)' : '1px solid transparent',
                  transition: 'all 0.2s ease' }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}>
                {active && (
                  <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: '3px', borderRadius: '0 3px 3px 0',
                    background: 'linear-gradient(180deg, #F5A623, #00B67A)' }} />
                )}
                <Icon style={{ width: '17px', height: '17px', flexShrink: 0,
                  color: active ? '#F5A623' : 'rgba(255,255,255,0.35)' }} />
                <span style={{ flex: 1, fontSize: '14px', fontWeight: active ? 700 : 400,
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.45)',
                  letterSpacing: '-0.01em' }}>{label}</span>
                {badge && (
                  <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px',
                    borderRadius: '999px', background: 'rgba(0,230,210,0.15)',
                    color: '#00E6D2', border: '1px solid rgba(0,230,210,0.3)',
                    letterSpacing: '0.05em', textTransform: 'uppercase' }}>{badge}</span>
                )}
                {active && <ChevronRight style={{ width: '13px', height: '13px', color: '#F5A623', opacity: 0.7 }} />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(245,166,35,0.1)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
            borderRadius: '12px', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)', marginBottom: '6px' }}>
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="" style={{ width: '34px', height: '34px', borderRadius: '10px', objectFit: 'cover' }} />
              : <div style={{ width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #F5A623, #00B67A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 800, color: '#080F20' }}>{initials}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'white', fontSize: '13px', fontWeight: 700, margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.full_name ?? 'User'}
              </p>
              <p style={{ color: 'rgba(0,230,210,0.7)', fontSize: '11px', margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button onClick={async () => { await logout(); router.push('/auth/login'); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '9px 12px', borderRadius: '10px', border: 'none',
              background: 'transparent', color: 'rgba(255,255,255,0.25)',
              fontSize: '13px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.2s', fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent'; }}>
            <LogOut style={{ width: '14px', height: '14px' }} />
            {t('common.signOut')}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header style={{ height: '64px', background: 'white', display: 'flex', alignItems: 'center',
          padding: '0 28px', gap: '16px', flexShrink: 0,
          borderBottom: '1px solid #E8EBF3', boxShadow: '0 1px 0 rgba(13,27,61,0.04)' }}>
          <button onClick={() => setSidebarOpen(true)} className="ga-hamburger"
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: '#0D1B3D', padding: '6px', borderRadius: '8px' }}>
            <Menu style={{ width: '20px', height: '20px' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>GeoAfric</span>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#0D1B3D',
              fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}>
              {currentPage?.label ?? 'Home'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button style={{ position: 'relative', background: 'none', border: 'none',
              cursor: 'pointer', padding: '8px', borderRadius: '10px', color: '#6B7280' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
              <Bell style={{ width: '18px', height: '18px' }} />
              <span style={{ position: 'absolute', top: '7px', right: '7px',
                width: '7px', height: '7px', borderRadius: '50%',
                background: '#F5A623', border: '2px solid white' }} />
            </button>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #F5A623, #00B67A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 800, color: '#080F20',
              boxShadow: '0 2px 8px rgba(245,166,35,0.3)', overflow: 'hidden' }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover' }} />
                : initials}
            </div>
          </div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px',
          background: 'linear-gradient(160deg, #F0F2F8 0%, #EDF0F8 100%)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}