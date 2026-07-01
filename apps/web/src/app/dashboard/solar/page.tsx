'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Zap, Battery, Sun, Activity, AlertTriangle,
  Wifi, WifiOff, Plus, CheckCircle, Clock,
  Thermometer, TrendingUp, ArrowRight, RefreshCw,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';

const SIMULATED = {
  solar_watts: 847, battery_pct: 72, battery_status: 'charging',
  load_watts: 340, grid_watts: -120, temperature_c: 41.2,
  efficiency_pct: 70.6, solar_voltage: 48.4, solar_current: 17.5,
};

// Static history — no Math.random() to avoid hydration mismatch
const SOLAR_HISTORY = [0,0,0,0,0,0,45,180,320,580,750,860,920,880,810,720,650,490,280,120,40,0,0,0];
const LOAD_HISTORY  = [180,190,200,210,220,230,280,320,360,380,400,410,390,370,360,350,340,330,310,290,260,240,210,195];

// ── Mini bar chart (client-only, no hydration issues) ─────────────────────────
function MiniChart({ data, color }: { data: number[]; color: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height: '40px' }} />;

  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '40px' }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: '2px',
          height: `${Math.max(4, (v / max) * 100)}%`,
          background: color, opacity: 0.7 + (i / data.length) * 0.3,
        }} />
      ))}
    </div>
  );
}

// ── Radial battery gauge ──────────────────────────────────────────────────────
function BatteryGauge({ pct, status }: { pct: number; status: string }) {
  const color = pct > 50 ? '#00B67A' : pct > 25 ? '#F5A623' : '#EF4444';
  const r = 52, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto' }}>
      <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="#F3F4F6" strokeWidth="10" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '24px', fontWeight: 950, color, fontFamily: 'Sora, sans-serif' }}>{pct}%</span>
        <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, textTransform: 'capitalize' }}>{status}</span>
      </div>
    </div>
  );
}

export default function SolarPage() {
  const [hasDevice, setHasDevice]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState<'overview'|'history'|'alerts'>('overview');

  useEffect(() => {
    apiClient.get('/solartrack/devices')
      .then(({ data }) => setHasDevice((data ?? []).length > 0))
      .catch(() => setHasDevice(false))
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); toast.success('Data refreshed'); }, 1200);
  };

  const card: React.CSSProperties = {
    background: 'white', borderRadius: '20px',
    boxShadow: '0 2px 12px rgba(13,27,61,0.07)', border: '1px solid #F3F4F6',
  };

  const STAT_CARDS = [
    { label: 'Generating',   value: `${SIMULATED.solar_watts}W`, sub: `${SIMULATED.efficiency_pct}% efficiency`,
      icon: Sun,         color: '#F5A623', bg: 'rgba(245,166,35,0.12)',  chart: SOLAR_HISTORY.slice(-8) },
    { label: 'Consuming',    value: `${SIMULATED.load_watts}W`,  sub: 'Home load',
      icon: Activity,    color: '#00E6D2', bg: 'rgba(0,230,210,0.12)',   chart: LOAD_HISTORY.slice(-8)  },
    { label: 'Grid',         value: `${Math.abs(SIMULATED.grid_watts)}W`,
      sub: SIMULATED.grid_watts < 0 ? '↑ Exporting surplus' : '↓ Importing',
      icon: Zap, color: SIMULATED.grid_watts < 0 ? '#00B67A' : '#EF4444',
      bg: SIMULATED.grid_watts < 0 ? 'rgba(0,182,122,0.12)' : 'rgba(239,68,68,0.08)',
      chart: [110,115,118,120,118,122,120,120] },
    { label: 'Temperature',  value: `${SIMULATED.temperature_c}°C`, sub: 'Panel surface',
      icon: Thermometer, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', chart: [38,39,39,40,41,41,41,41] },
  ];

  const ALERTS = [
    { icon: '☀️', title: 'Peak generation achieved',   time: '2h ago', resolved: true  },
    { icon: '🔋', title: 'Battery dipped below 30%',   time: '6h ago', resolved: true  },
    { icon: '⚡', title: 'Exporting 120W to grid',      time: '1h ago', resolved: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0D1B3D', fontFamily: 'Sora, sans-serif', margin: 0 }}>SolarTrack</h1>
          </div>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Showing simulated data until your device ships</p>
        </div>
        <button onClick={handleRefresh}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
            borderRadius: '12px', border: '1px solid #E5E7EB', background: 'white',
            fontSize: '13px', fontWeight: 600, color: '#0D1B3D', cursor: 'pointer', fontFamily: 'inherit' }}>
          <RefreshCw style={{ width: '14px', height: '14px',
            animation: refreshing ? 'solar-spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Device banner */}
      <div style={{ background: 'linear-gradient(135deg, #0D1B3D 0%, #12295C 60%, #1E3A5F 100%)',
        borderRadius: '24px', padding: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px',
          borderRadius: '50%', background: 'rgba(245,166,35,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '18px',
              background: hasDevice ? 'rgba(0,182,122,0.25)' : 'rgba(245,166,35,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {hasDevice
                ? <Wifi style={{ width: '24px', height: '24px', color: '#00E6D2' }} />
                : <WifiOff style={{ width: '24px', height: '24px', color: '#F5A623' }} />}
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 3px', fontFamily: 'Sora, sans-serif' }}>
                {hasDevice ? 'Device Connected' : 'No Device Registered'}
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                {hasDevice ? 'SolarTrack hardware reporting normally' : 'Register your SolarTrack device when it ships'}
              </p>
            </div>
          </div>
          {!hasDevice && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ padding: '10px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                📦 Device shipping soon
              </div>
              <button disabled style={{ display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 16px', borderRadius: '14px', background: '#F5A623', color: '#0D1B3D',
                fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'not-allowed',
                opacity: 0.6, fontFamily: 'inherit' }}>
                <Plus style={{ width: '14px', height: '14px' }} /> Register Device
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6', padding: '4px',
        borderRadius: '14px', width: 'fit-content' }}>
        {(['overview','history','alerts'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', fontFamily: 'inherit',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
              background: activeTab === tab ? 'white' : 'transparent',
              color: activeTab === tab ? '#0D1B3D' : '#6B7280',
              boxShadow: activeTab === tab ? '0 1px 4px rgba(13,27,61,0.1)' : 'none',
              transition: 'all 0.15s' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }}
            className="solar-stats">
            {STAT_CARDS.map(({ label, value, sub, icon: Icon, color, bg, chart }) => (
              <div key={label} style={{ ...card, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: '20px', height: '20px', color }} />
                  </div>
                  <span style={{ padding: '4px 8px', borderRadius: '8px', background: '#F9FAFB',
                    fontSize: '11px', fontWeight: 600, color: '#9CA3AF' }}>Live</span>
                </div>
                <p style={{ fontSize: '26px', fontWeight: 950, color: '#0D1B3D',
                  fontFamily: 'Sora, sans-serif', margin: '0 0 2px', letterSpacing: '-0.03em' }}>{value}</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3D', margin: '0 0 2px' }}>{label}</p>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 12px' }}>{sub}</p>
                <MiniChart data={chart} color={color} />
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
            className="solar-main">
            {/* Battery */}
            <div style={{ ...card, padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3D', fontFamily: 'Sora, sans-serif',
                margin: '0 0 16px', textAlign: 'left' }}>Battery Status</p>
              <BatteryGauge pct={SIMULATED.battery_pct} status={SIMULATED.battery_status} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
                {[{ label: 'Voltage', value: `${SIMULATED.solar_voltage}V` },
                  { label: 'Current', value: `${SIMULATED.solar_current}A` }].map(({ label, value }) => (
                  <div key={label} style={{ padding: '10px', borderRadius: '12px', background: '#F9FAFB' }}>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 2px', fontWeight: 600 }}>{label}</p>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3D', margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's generation */}
            <div style={{ ...card, padding: '24px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3D', fontFamily: 'Sora, sans-serif', margin: '0 0 16px' }}>
                Today's Generation
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[{ label: 'Generated', value: '4.2 kWh', color: '#F5A623', pct: 70 },
                  { label: 'Consumed',  value: '2.8 kWh', color: '#00E6D2', pct: 47 },
                  { label: 'Exported',  value: '1.4 kWh', color: '#00B67A', pct: 23 }].map(({ label, value, color, pct }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>{label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#0D1B3D' }}>{value}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '999px', background: '#F3F4F6', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '16px', padding: '12px', borderRadius: '14px',
                background: 'rgba(0,182,122,0.08)', border: '1px solid rgba(0,182,122,0.2)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#065F46', margin: '0 0 2px' }}>💚 Saving ~GHS 18.60 today</p>
                <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>vs grid price at GHS 1.32/kWh</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div style={{ ...card, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0D1B3D', fontFamily: 'Sora, sans-serif', margin: 0 }}>
              24-Hour Generation vs Consumption
            </h3>
            <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>Simulated</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '120px', marginBottom: '8px' }}>
            {SOLAR_HISTORY.map((solar, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', gap: '1px', alignItems: 'flex-end', height: '100%' }}>
                <div style={{ flex: 1, borderRadius: '2px 2px 0 0', background: '#F5A623',
                  height: `${Math.max(2, (solar / 1000) * 100)}%`, opacity: 0.8 }} />
                <div style={{ flex: 1, borderRadius: '2px 2px 0 0', background: '#00E6D2',
                  height: `${Math.max(2, (LOAD_HISTORY[i] / 1000) * 100)}%`, opacity: 0.7 }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['00','03','06','09','12','15','18','21'].map(h => (
              <span key={h} style={{ flex: 1, fontSize: '10px', color: '#9CA3AF', fontWeight: 600, textAlign: 'center' }}>{h}:00</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            {[{ color: '#F5A623', label: 'Solar generation' }, { color: '#00E6D2', label: 'Home consumption' }].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color }} />
                <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {activeTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ALERTS.map((alert, i) => (
            <div key={i} style={{ ...card, padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '14px', flexShrink: 0,
                background: alert.resolved ? '#F0FDF4' : '#FEF5E7',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                {alert.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3D', margin: '0 0 2px' }}>{alert.title}</p>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock style={{ width: '11px', height: '11px' }} /> {alert.time}
                </p>
              </div>
              {alert.resolved
                ? <CheckCircle style={{ width: '18px', height: '18px', color: '#00B67A', flexShrink: 0 }} />
                : <AlertTriangle style={{ width: '18px', height: '18px', color: '#F5A623', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ borderRadius: '24px', padding: '28px',
        background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
        border: '1px solid #FDE68A', display: 'flex', gap: '20px',
        alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', margin: '0 0 6px',
            textTransform: 'uppercase', letterSpacing: '0.08em' }}>SolarTrack Hardware</p>
          <h3 style={{ fontSize: '18px', fontWeight: 950, color: '#0D1B3D', fontFamily: 'Sora, sans-serif', margin: '0 0 6px' }}>
            The device is on its way 🛰️
          </h3>
          <p style={{ fontSize: '13px', color: '#78350F', margin: 0, lineHeight: 1.6 }}>
            Your dashboard is fully ready — just register your device when it ships.
          </p>
        </div>
        <a href="mailto:solar@alphaztechnology.com"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            borderRadius: '14px', background: '#F5A623', color: '#0D1B3D',
            fontSize: '13px', fontWeight: 800, textDecoration: 'none',
            boxShadow: '0 8px 20px rgba(245,166,35,0.3)', flexShrink: 0 }}>
          Pre-order interest <ArrowRight style={{ width: '14px', height: '14px' }} />
        </a>
      </div>

      <style>{`
        @keyframes solar-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media (max-width: 640px) { .solar-stats, .solar-main { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
