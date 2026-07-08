'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart, Activity, Target, Zap, TrendingUp,
  Plus, RefreshCw, Loader2, CheckCircle2,
  AlertTriangle, Info, Award, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { healthApi } from '@/lib/api/health';

// ── Types ─────────────────────────────────────────────────────────────────────
interface HRStats   { avg: number|null; min: number|null; max: number|null; count: number; latest: any }
interface Activity  { steps: number; calories: number; distance_m: number; active_mins: number; date: string }
interface Goals     { daily_steps: number; target_bpm_min: number; target_bpm_max: number; daily_water_ml: number }
interface Insight   { id: string; type: string; title: string; message: string; severity: string; read: boolean; created_at: string }

// ── Helpers ───────────────────────────────────────────────────────────────────
const bpmZone = (bpm: number) => {
  if (bpm < 60)  return { label: 'Low',        color: '#3B82F6' };
  if (bpm < 100) return { label: 'Normal',     color: '#00B67A' };
  if (bpm < 140) return { label: 'Elevated',   color: '#F5A623' };
  return             { label: 'High',          color: '#EF4444' };
};

const severityIcon = (severity: string) => {
  if (severity === 'critical') return <AlertTriangle style={{ width: '16px', height: '16px', color: '#EF4444' }} />;
  if (severity === 'warning')  return <AlertTriangle style={{ width: '16px', height: '16px', color: '#F5A623' }} />;
  return <Info style={{ width: '16px', height: '16px', color: '#00B67A' }} />;
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HealthPage() {
  const [tab, setTab]             = useState<'overview'|'heart'|'activity'|'goals'|'insights'>('overview');
  const [hrStats, setHrStats]     = useState<HRStats | null>(null);
  const [today, setToday]         = useState<Activity | null>(null);
  const [goals, setGoals]         = useState<Goals | null>(null);
  const [insights, setInsights]   = useState<Insight[]>([]);
  const [hrHistory, setHrHistory] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [stats, act, gl, ins] = await Promise.all([
        healthApi.getHRStats(),
        healthApi.getTodayActivity(),
        healthApi.getGoals(),
        healthApi.getInsights(),
      ]);
      setHrStats(stats.data);
      setToday(act.data);
      setGoals(gl.data);
      setInsights(ins.data ?? []);
    } catch { /* silent — user may have no data yet */ }
    finally { setLoading(false); }
  };

  const TABS = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'heart',     label: 'Heart Rate' },
    { id: 'activity',  label: 'Activity'  },
    { id: 'goals',     label: 'Goals'     },
    { id: 'insights',  label: 'AI Insights'},
  ];

  const unreadCount = insights.filter(i => !i.read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0D1B3D',
            fontFamily: 'Sora, sans-serif', margin: '0 0 2px' }}>Health & Wellness</h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Monitor your vitals, activity and AI-powered insights
          </p>
        </div>
        <button onClick={loadAll}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
            borderRadius: '12px', border: '1.5px solid #E5E7EB', background: 'white',
            fontSize: '13px', fontWeight: '600', color: '#0D1B3D', cursor: 'pointer' }}>
          <RefreshCw style={{ width: '14px', height: '14px' }} />
          Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', background: '#F3F4F6',
        padding: '4px', borderRadius: '14px', width: 'fit-content', flexWrap: 'wrap' }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id as any)}
            style={{ padding: '8px 16px', borderRadius: '10px', border: 'none',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', position: 'relative',
              background: tab === id ? 'white' : 'transparent',
              color: tab === id ? '#0D1B3D' : '#6B7280',
              boxShadow: tab === id ? '0 1px 4px rgba(13,27,61,0.1)' : 'none',
              transition: 'all 0.15s', fontFamily: 'inherit' }}>
            {label}
            {id === 'insights' && unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px',
                borderRadius: '50%', background: '#EF4444' }} />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 style={{ width: '32px', height: '32px', color: '#00B67A', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <>
          {tab === 'overview'  && <OverviewTab  hrStats={hrStats} today={today} goals={goals} insights={insights} onTabChange={setTab} />}
          {tab === 'heart'     && <HeartRateTab hrHistory={hrHistory} setHrHistory={setHrHistory} hrStats={hrStats} setHrStats={setHrStats} goals={goals} />}
          {tab === 'activity'  && <ActivityTab  today={today} setToday={setToday} goals={goals} />}
          {tab === 'goals'     && <GoalsTab     goals={goals} setGoals={setGoals} />}
          {tab === 'insights'  && <InsightsTab  insights={insights} setInsights={setInsights} />}
        </>
      )}

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ hrStats, today, goals, insights, onTabChange }: any) {
  const stepPct  = goals && today ? Math.min(100, Math.round((today.steps / goals.daily_steps) * 100)) : 0;
  const latestBpm = hrStats?.latest?.bpm;
  const zone     = latestBpm ? bpmZone(latestBpm) : null;

  const cards = [
    {
      label: 'Heart Rate',
      value: latestBpm ? `${latestBpm} BPM` : '—',
      sub:   zone?.label ?? 'No reading yet',
      icon:  Heart,
      color: zone?.color ?? '#9CA3AF',
      tab:   'heart',
    },
    {
      label: 'Steps Today',
      value: today?.steps?.toLocaleString() ?? '0',
      sub:   `${stepPct}% of ${goals?.daily_steps?.toLocaleString() ?? '8,000'} goal`,
      icon:  Activity,
      color: stepPct >= 100 ? '#00B67A' : '#F5A623',
      tab:   'activity',
    },
    {
      label: 'Active Minutes',
      value: `${today?.active_mins ?? 0} min`,
      sub:   'Today',
      icon:  Zap,
      color: '#00E6D2',
      tab:   'activity',
    },
    {
      label: 'AI Insights',
      value: `${insights.length}`,
      sub:   `${insights.filter((i: any) => !i.read).length} unread`,
      icon:  TrendingUp,
      color: '#0D1B3D',
      tab:   'insights',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }}>
        {cards.map(({ label, value, sub, icon: Icon, color, tab }) => (
          <button key={label} onClick={() => onTabChange(tab)}
            style={{ background: 'white', borderRadius: '20px', padding: '20px',
              boxShadow: '0 2px 12px rgba(13,27,61,0.07)', border: 'none', cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.2s', width: '100%' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,27,61,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(13,27,61,0.07)'; }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px',
              background: color, display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '12px' }}>
              <Icon style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#0D1B3D',
              fontFamily: 'Sora, sans-serif', margin: '0 0 2px' }}>{value}</p>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#0D1B3D', margin: '0 0 2px' }}>{label}</p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{sub}</p>
          </button>
        ))}
      </div>

      {/* Step progress bar */}
      {goals && today && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px',
          boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0D1B3D',
              fontFamily: 'Sora, sans-serif', margin: 0 }}>Daily Step Progress</h3>
            <span style={{ fontSize: '13px', fontWeight: '700', color: stepPct >= 100 ? '#00B67A' : '#F5A623' }}>
              {stepPct}%
            </span>
          </div>
          <div style={{ height: '10px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '999px', width: `${stepPct}%`,
              background: stepPct >= 100
                ? 'linear-gradient(90deg, #00B67A, #00E6D2)'
                : 'linear-gradient(90deg, #F5A623, #00E6D2)',
              transition: 'width 0.6s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>{today.steps.toLocaleString()} steps</span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>{goals.daily_steps.toLocaleString()} goal</span>
          </div>
        </div>
      )}

      {/* Latest insights preview */}
      {insights.length > 0 && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px',
          boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0D1B3D',
            fontFamily: 'Sora, sans-serif', margin: '0 0 14px' }}>Latest Insight</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start',
            padding: '14px', borderRadius: '12px', background: '#F9FAFB' }}>
            {severityIcon(insights[0].severity)}
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#0D1B3D', margin: '0 0 3px' }}>{insights[0].title}</p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{insights[0].message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Heart Rate Tab ────────────────────────────────────────────────────────────
function HeartRateTab({ hrHistory, setHrHistory, hrStats, setHrStats, goals }: any) {
  const [bpm, setBpm]         = useState('');
  const [saving, setSaving]   = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanBpm, setScanBpm] = useState<number | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    healthApi.getHeartRate(20).then(r => setHrHistory(r.data ?? []));
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Camera-based HR simulation (real implementation uses device camera + rPPG)
  const startCameraScan = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScanning(true);
    setScanBpm(null);
    setScanProgress(0);
    let progress = 0;
    timerRef.current = setInterval(() => {
      progress += 2;
      setScanProgress(progress);
      if (progress >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        // Simulated BPM — in production: real rPPG from camera frames
        const simBpm = Math.floor(65 + Math.random() * 30);
        setScanBpm(simBpm);
        setBpm(simBpm.toString());
        setScanning(false);
      }
    }, 60); // ~3 seconds total
  };

  const handleLog = async () => {
    const val = parseInt(bpm);
    if (isNaN(val) || val < 20 || val > 300) { toast.error('Enter a valid BPM (20–300)'); return; }
    setSaving(true);
    try {
      await healthApi.logHeartRate({ bpm: val, method: scanBpm ? 'camera' : 'manual' });
      toast.success('Heart rate logged!');
      setBpm(''); setScanBpm(null);
      const [history, stats] = await Promise.all([healthApi.getHeartRate(20), healthApi.getHRStats()]);
      setHrHistory(history.data ?? []);
      setHrStats(stats.data);
    } catch { toast.error('Failed to log reading.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats row */}
      {hrStats && hrStats.count > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {[
            { label: 'Average', value: `${hrStats.avg} BPM`, color: '#00B67A' },
            { label: 'Minimum', value: `${hrStats.min} BPM`, color: '#3B82F6' },
            { label: 'Maximum', value: `${hrStats.max} BPM`, color: '#EF4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'white', borderRadius: '16px', padding: '16px',
              boxShadow: '0 2px 8px rgba(13,27,61,0.07)', textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '800', color, margin: '0 0 2px',
                fontFamily: 'Sora, sans-serif' }}>{value}</p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{label} (7d)</p>
            </div>
          ))}
        </div>
      )}

      {/* Log reading card */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px',
        boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0D1B3D',
          fontFamily: 'Sora, sans-serif', margin: '0 0 16px' }}>Log Heart Rate</h3>

        {/* Camera scan */}
        <div style={{ padding: '20px', borderRadius: '16px', background: '#F0FDF4',
          border: '1px solid #BBF7D0', marginBottom: '16px', textAlign: 'center' }}>
          <Heart style={{ width: '36px', height: '36px', color: '#00B67A', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '13px', color: '#065F46', fontWeight: '600', margin: '0 0 12px' }}>
            Camera-based detection
          </p>
          {scanning ? (
            <div>
              <div style={{ height: '6px', background: '#D1FAE5', borderRadius: '999px', overflow: 'hidden', margin: '0 0 8px' }}>
                <div style={{ height: '100%', background: '#00B67A', borderRadius: '999px',
                  width: `${scanProgress}%`, transition: 'width 0.1s linear' }} />
              </div>
              <p style={{ fontSize: '12px', color: '#065F46', margin: 0 }}>Scanning… {scanProgress}%</p>
            </div>
          ) : scanBpm ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <CheckCircle2 style={{ width: '18px', height: '18px', color: '#00B67A' }} />
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#0D1B3D' }}>{scanBpm} BPM detected</span>
            </div>
          ) : (
            <button onClick={startCameraScan}
              style={{ padding: '10px 24px', borderRadius: '12px', border: 'none',
                background: '#00B67A', color: 'white', fontWeight: '700', fontSize: '13px',
                cursor: 'pointer', fontFamily: 'inherit' }}>
              Start Camera Scan
            </button>
          )}
          <p style={{ fontSize: '11px', color: '#6EE7B7', margin: '8px 0 0' }}>
            Place finger on camera or point camera at wrist
          </p>
        </div>

        {/* Manual entry */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="number" value={bpm} onChange={e => setBpm(e.target.value)}
            placeholder="Enter BPM manually" min={20} max={300}
            style={{ flex: 1, padding: '12px 14px', borderRadius: '12px',
              border: '1.5px solid #E5E7EB', fontSize: '14px', color: '#0D1B3D',
              background: 'white', outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => { e.target.style.borderColor = '#00B67A'; }}
            onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; }}
            onKeyDown={e => e.key === 'Enter' && handleLog()} />
          <button onClick={handleLog} disabled={saving || !bpm}
            style={{ padding: '12px 20px', borderRadius: '12px', border: 'none',
              background: saving || !bpm ? '#E5E7EB' : '#F5A623',
              color: saving || !bpm ? '#9CA3AF' : '#0D1B3D',
              fontWeight: '700', fontSize: '13px', cursor: saving || !bpm ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}>
            {saving ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Plus style={{ width: '14px', height: '14px' }} />}
            Log
          </button>
        </div>
      </div>

      {/* History */}
      {hrHistory.length > 0 && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px',
          boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0D1B3D',
            fontFamily: 'Sora, sans-serif', margin: '0 0 14px' }}>Recent Readings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {hrHistory.slice(0, 10).map((r: any) => {
              const z = bpmZone(r.bpm);
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px', borderRadius: '12px', background: '#F9FAFB' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: z.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#0D1B3D',
                    fontFamily: 'Sora, sans-serif', flex: 1 }}>{r.bpm} BPM</span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: z.color,
                    padding: '2px 8px', borderRadius: '999px', background: `${z.color}20` }}>{z.label}</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                    {new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Activity Tab ──────────────────────────────────────────────────────────────
function ActivityTab({ today, setToday, goals }: any) {
  const [form, setForm] = useState({ steps: '', calories: '', active_mins: '' });
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    healthApi.getActivityHistory(7).then(r => setHistory(r.data ?? []));
  }, []);

  const handleLog = async () => {
    if (!form.steps) { toast.error('Enter step count'); return; }
    setSaving(true);
    try {
      const { data } = await healthApi.logActivity({
        steps:       parseInt(form.steps),
        calories:    form.calories ? parseFloat(form.calories) : undefined,
        active_mins: form.active_mins ? parseInt(form.active_mins) : undefined,
      });
      setToday(data);
      setHistory(prev => [data, ...prev.filter((h: any) => h.date !== data.date)]);
      toast.success('Activity logged!');
      setForm({ steps: '', calories: '', active_mins: '' });
    } catch { toast.error('Failed to log activity.'); }
    finally { setSaving(false); }
  };

  const stepPct = goals && today ? Math.min(100, Math.round((today.steps / goals.daily_steps) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Today summary */}
      <div style={{ background: 'linear-gradient(135deg, #F5A623 0%, #F8C165 100%)',
        borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px',
          borderRadius: '50%', background: 'rgba(255,255,255,0.15)', pointerEvents: 'none' }} />
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#7C2D12', margin: '0 0 16px' }}>Today&apos;s Activity</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {[
            { label: 'Steps',   value: today?.steps?.toLocaleString() ?? '0',     unit: '' },
            { label: 'Cal',     value: Math.round(today?.calories ?? 0).toString(), unit: 'kcal' },
            { label: 'Active',  value: (today?.active_mins ?? 0).toString(),        unit: 'min' },
          ].map(({ label, value, unit }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '22px', fontWeight: '800', color: '#0D1B3D',
                fontFamily: 'Sora, sans-serif', margin: '0 0 2px' }}>{value}</p>
              <p style={{ fontSize: '11px', color: '#92400E', margin: 0 }}>{label} {unit}</p>
            </div>
          ))}
        </div>
        {goals && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#0D1B3D', borderRadius: '999px',
                width: `${stepPct}%`, transition: 'width 0.6s ease' }} />
            </div>
            <p style={{ fontSize: '11px', color: '#92400E', margin: '4px 0 0' }}>
              {stepPct}% of {goals.daily_steps.toLocaleString()} step goal
            </p>
          </div>
        )}
      </div>

      {/* Log activity */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px',
        boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0D1B3D',
          fontFamily: 'Sora, sans-serif', margin: '0 0 16px' }}>Update Today&apos;s Activity</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '12px' }}>
          {[
            { field: 'steps',       label: 'Steps',          placeholder: 'e.g. 5000' },
            { field: 'calories',    label: 'Calories (kcal)', placeholder: 'e.g. 210'  },
            { field: 'active_mins', label: 'Active minutes',  placeholder: 'e.g. 45'   },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600',
                color: '#0D1B3D', marginBottom: '5px' }}>{label}</label>
              <input type="number" value={(form as any)[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={placeholder}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: '1.5px solid #E5E7EB', fontSize: '13px', color: '#0D1B3D',
                  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                onFocus={e => { e.target.style.borderColor = '#F5A623'; }}
                onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; }} />
            </div>
          ))}
        </div>
        <button onClick={handleLog} disabled={saving}
          style={{ padding: '11px 20px', borderRadius: '12px', border: 'none',
            background: '#F5A623', color: '#0D1B3D', fontWeight: '700', fontSize: '13px',
            cursor: saving ? 'not-allowed' : 'pointer', display: 'flex',
            alignItems: 'center', gap: '6px', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
          {saving ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Plus style={{ width: '14px', height: '14px' }} />}
          {saving ? 'Saving…' : 'Log Activity'}
        </button>
      </div>

      {/* 7-day history */}
      {history.length > 0 && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '20px',
          boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0D1B3D',
            fontFamily: 'Sora, sans-serif', margin: '0 0 14px' }}>7-Day History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((day: any) => {
              const pct = goals ? Math.min(100, Math.round((day.steps / goals.daily_steps) * 100)) : 0;
              return (
                <div key={day.date} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', width: '64px', flexShrink: 0 }}>
                    {new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <div style={{ flex: 1, height: '8px', background: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '999px', width: `${pct}%`,
                      background: pct >= 100 ? '#00B67A' : '#F5A623' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0D1B3D', width: '60px', textAlign: 'right' }}>
                    {day.steps.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Goals Tab ─────────────────────────────────────────────────────────────────
function GoalsTab({ goals, setGoals }: any) {
  const [form, setForm] = useState({ daily_steps: '', target_bpm_min: '', target_bpm_max: '', daily_water_ml: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (goals) setForm({
      daily_steps:    goals.daily_steps?.toString() ?? '',
      target_bpm_min: goals.target_bpm_min?.toString() ?? '',
      target_bpm_max: goals.target_bpm_max?.toString() ?? '',
      daily_water_ml: goals.daily_water_ml?.toString() ?? '',
    });
  }, [goals]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await healthApi.updateGoals({
        daily_steps:    parseInt(form.daily_steps),
        target_bpm_min: parseInt(form.target_bpm_min),
        target_bpm_max: parseInt(form.target_bpm_max),
        daily_water_ml: parseInt(form.daily_water_ml),
      });
      setGoals(data);
      toast.success('Goals updated!');
    } catch { toast.error('Failed to update goals.'); }
    finally { setSaving(false); }
  };

  const GOAL_FIELDS = [
    { field: 'daily_steps',    label: 'Daily Steps Goal',        placeholder: '8000',  icon: Activity },
    { field: 'target_bpm_min', label: 'Min Heart Rate (BPM)',    placeholder: '60',    icon: Heart    },
    { field: 'target_bpm_max', label: 'Max Heart Rate (BPM)',    placeholder: '100',   icon: Heart    },
    { field: 'daily_water_ml', label: 'Daily Water Goal (ml)',   placeholder: '2000',  icon: Target   },
  ];

  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '24px',
      boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0D1B3D',
        fontFamily: 'Sora, sans-serif', margin: '0 0 20px' }}>Health Goals</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {GOAL_FIELDS.map(({ field, label, placeholder, icon: Icon }) => (
          <div key={field}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '6px' }}>
              <Icon style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />
              {label}
            </label>
            <input type="number" value={(form as any)[field]}
              onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              placeholder={placeholder}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '12px',
                border: '1.5px solid #E5E7EB', fontSize: '14px', color: '#0D1B3D',
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              onFocus={e => { e.target.style.borderColor = '#00B67A'; e.target.style.boxShadow = '0 0 0 3px rgba(0,182,122,0.1)'; }}
              onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
          </div>
        ))}
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '13px', borderRadius: '14px', border: 'none',
            background: '#00B67A', color: 'white', fontWeight: '700', fontSize: '14px',
            cursor: saving ? 'not-allowed' : 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'inherit', marginTop: '4px', opacity: saving ? 0.75 : 1 }}>
          {saving ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 style={{ width: '16px', height: '16px' }} />}
          {saving ? 'Saving…' : 'Save Goals'}
        </button>
      </div>
    </div>
  );
}

// ── Insights Tab ──────────────────────────────────────────────────────────────
function InsightsTab({ insights, setInsights }: any) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await healthApi.generateInsight();
      setInsights((prev: Insight[]) => [data, ...prev]);
      toast.success('New insight generated!');
    } catch { toast.error('Failed to generate insight.'); }
    finally { setGenerating(false); }
  };

  const handleMarkRead = async (id: string) => {
    await healthApi.markInsightRead(id);
    setInsights((prev: Insight[]) => prev.map(i => i.id === id ? { ...i, read: true } : i));
  };

  const insightBg = (severity: string) => {
    if (severity === 'critical') return { bg: '#FEF2F2', border: '#FECACA' };
    if (severity === 'warning')  return { bg: '#FEF5E7', border: '#FDE68A' };
    return { bg: '#F0FDF4', border: '#BBF7D0' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Generate button */}
      <div style={{ background: 'linear-gradient(135deg, #0D1B3D 0%, #1E3A7A 100%)',
        borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white',
            fontFamily: 'Sora, sans-serif', margin: '0 0 4px' }}>AI Health Assistant</h3>
          <p style={{ fontSize: '12px', color: '#93C5FD', margin: 0 }}>
            Get personalised health tips based on your data
          </p>
        </div>
        <button onClick={handleGenerate} disabled={generating}
          style={{ padding: '10px 18px', borderRadius: '12px', border: 'none',
            background: '#F5A623', color: '#0D1B3D', fontWeight: '700', fontSize: '13px',
            cursor: generating ? 'not-allowed' : 'pointer', display: 'flex',
            alignItems: 'center', gap: '6px', flexShrink: 0, fontFamily: 'inherit',
            opacity: generating ? 0.75 : 1 }}>
          {generating ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Zap style={{ width: '14px', height: '14px' }} />}
          {generating ? 'Generating…' : 'Generate Insight'}
        </button>
      </div>

      {/* Insights list */}
      {insights.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white',
          borderRadius: '20px', boxShadow: '0 2px 12px rgba(13,27,61,0.07)' }}>
          <Zap style={{ width: '40px', height: '40px', color: '#D1D5DB', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280', margin: '0 0 4px' }}>No insights yet</p>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
            Log some heart rate and activity data, then generate your first insight.
          </p>
        </div>
      ) : (
        insights.map((insight: Insight) => {
          const { bg, border } = insightBg(insight.severity);
          return (
            <div key={insight.id} style={{ background: bg, border: `1px solid ${border}`,
              borderRadius: '16px', padding: '16px',
              opacity: insight.read ? 0.7 : 1, transition: 'opacity 0.2s' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ marginTop: '1px', flexShrink: 0 }}>{severityIcon(insight.severity)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#0D1B3D', margin: 0 }}>
                      {insight.title}
                    </p>
                    {!insight.read && (
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%',
                        background: '#EF4444', display: 'inline-block', flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: '#374151', margin: '0 0 8px', lineHeight: '1.5' }}>
                    {insight.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                      {new Date(insight.created_at).toLocaleDateString()}
                    </span>
                    {!insight.read && (
                      <button onClick={() => handleMarkRead(insight.id)}
                        style={{ fontSize: '11px', color: '#6B7280', background: 'none',
                          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                          textDecoration: 'underline' }}>
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
