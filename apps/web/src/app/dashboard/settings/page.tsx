'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Shield,
  Smartphone,
  Save,
  Loader2,
  CheckCircle2,
  Camera,
  Globe2,
  Mail,
  Phone,
  MapPin,
  Crown,
  Trash2,
  LockKeyhole,
  MonitorSmartphone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSupabaseClient } from '@/lib/supabase';
import { usersApi } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';
import { useTranslation } from '@/i18n/TranslationProvider';
import { type Locale } from '@/i18n/config';

const TAB_IDS = [
  {
    id: 'profile',
    labelKey: 'settings.profile',
    description: 'Personal info and preferred language',
    icon: User,
  },
  {
    id: 'notifs',
    labelKey: 'settings.notifications',
    description: 'Alerts, email, SMS and quiet hours',
    icon: Bell,
  },
  {
    id: 'security',
    labelKey: 'settings.security',
    description: 'Password and account protection',
    icon: Shield,
  },
  {
    id: 'devices',
    labelKey: 'settings.devices',
    description: 'Phones and browsers receiving alerts',
    icon: Smartphone,
  },
];

const colors = {
  navy: '#0D1B3D',
  navy2: '#12295C',
  green: '#00B67A',
  gold: '#F5A623',
  bg: '#F6F8FC',
  text: '#0D1B3D',
  muted: '#6B7280',
  border: '#E5E7EB',
  soft: '#F9FAFB',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.92)',
  border: '1px solid rgba(229,231,235,0.9)',
  borderRadius: '24px',
  boxShadow: '0 18px 45px rgba(13,27,61,0.08)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '14px',
  border: `1.5px solid ${colors.border}`,
  fontSize: '14px',
  color: colors.text,
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

export default function SettingsPage() {
  const [tab, setTab] = useState('profile');
  const { t } = useTranslation();
  const activeTab = TAB_IDS.find(item => item.id === tab) ?? TAB_IDS[0];

  return (
    <div style={{
      width: '100%',
      maxWidth: '1120px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '28px',
        padding: '28px',
        background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navy2} 58%, #0B6B63 100%)`,
        color: 'white',
        boxShadow: '0 24px 60px rgba(13,27,61,0.22)',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.16,
          backgroundImage: 'radial-gradient(circle at 20% 20%, white 0 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 0 1px, transparent 1px)',
          backgroundSize: '34px 34px, 42px 42px',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 12px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
              marginBottom: '14px',
              fontSize: '12px',
              fontWeight: 700,
            }}>
              <Globe2 style={{ width: '14px', height: '14px', color: colors.gold }} />
              GeoAfric Account Center
            </div>

            <h1 style={{
              fontSize: 'clamp(26px, 4vw, 38px)',
              lineHeight: 1.08,
              fontWeight: 900,
              fontFamily: 'Sora, sans-serif',
              margin: '0 0 8px',
              letterSpacing: '-0.04em',
            }}>
              {t('settings.title')}
            </h1>
            <p style={{ maxWidth: '620px', fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.76)', margin: 0 }}>
              {t('settings.subtitle')}
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.16)',
            backdropFilter: 'blur(10px)',
          }}>
            <Crown style={{ width: '18px', height: '18px', color: colors.gold }} />
            <div>
              <p style={{ fontSize: '12px', margin: 0, color: 'rgba(255,255,255,0.68)' }}>Current plan</p>
              <p style={{ fontSize: '14px', margin: 0, fontWeight: 800 }}>Free Plan</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)', gap: '22px', alignItems: 'start' }} className="settings-grid">
        <aside style={{ ...cardStyle, padding: '12px', position: 'sticky', top: '18px' }}>
          {TAB_IDS.map(({ id, labelKey, description, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '18px',
                  border: active ? `1px solid rgba(245,166,35,0.55)` : '1px solid transparent',
                  background: active ? 'linear-gradient(135deg, rgba(245,166,35,0.18), rgba(0,182,122,0.08))' : 'transparent',
                  color: active ? colors.navy : colors.muted,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  transition: 'all 0.18s ease',
                }}
              >
                <span style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: active ? colors.navy : colors.soft,
                  color: active ? 'white' : colors.muted,
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: '18px', height: '18px' }} />
                </span>
                <span>
                  <span style={{ display: 'block', fontSize: '14px', fontWeight: 800 }}>{t(labelKey)}</span>
                  <span style={{ display: 'block', fontSize: '11px', lineHeight: 1.35, marginTop: '2px', color: active ? '#526179' : '#9CA3AF' }}>{description}</span>
                </span>
              </button>
            );
          })}
        </aside>

        <main style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <activeTab.icon style={{ width: '20px', height: '20px', color: colors.gold }} />
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: colors.navy, fontFamily: 'Sora, sans-serif', margin: 0 }}>
              {t(activeTab.labelKey)}
            </h2>
          </div>

          {tab === 'profile' && <ProfileTab />}
          {tab === 'notifs' && <NotifsTab />}
          {tab === 'security' && <SecurityTab />}
          {tab === 'devices' && <DevicesTab />}
        </main>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media (max-width: 860px) {
          .settings-grid { grid-template-columns: 1fr !important; }
          .settings-grid aside { position: static !important; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .settings-grid aside { grid-template-columns: 1fr !important; }
          .settings-form-grid { grid-template-columns: 1fr !important; }
          .security-row { flex-direction: column !important; }
          .security-row button { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}

function FieldLabel({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: colors.navy, marginBottom: '7px' }}>
      {Icon && <Icon style={{ width: '13px', height: '13px', color: colors.gold }} />}
      {children}
    </label>
  );
}

function PrimaryButton({ children, onClick, disabled, tone = 'gold' }: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'gold' | 'green' | 'navy';
}) {
  const bg = tone === 'green' ? colors.green : tone === 'navy' ? colors.navy : colors.gold;
  const text = tone === 'gold' ? colors.navy : 'white';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 18px',
        borderRadius: '14px',
        border: 'none',
        background: bg,
        color: text,
        fontWeight: 900,
        fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        opacity: disabled ? 0.75 : 1,
        boxShadow: tone === 'gold' ? '0 12px 24px rgba(245,166,35,0.25)' : '0 12px 24px rgba(13,27,61,0.15)',
      }}
    >
      {children}
    </button>
  );
}

function ProfileTab() {
  const { user, setUser } = useAuthStore();
  const { setLocale, locale: currentLocale, LOCALES, LOCALE_NAMES } = useTranslation();
  const [form, setForm] = useState({ full_name: '', phone: '', city: '', language: 'en' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        full_name: user.full_name ?? '',
        phone: user.phone ?? '',
        language: currentLocale,
      }));
    }
  }, [user, currentLocale]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await usersApi.updateProfile({ full_name: form.full_name, phone: form.phone, language: form.language });
      setUser({ ...user!, full_name: form.full_name, phone: form.phone });

      if (form.language !== currentLocale) {
        toast.success('Profile updated! Switching language…');
        setTimeout(() => setLocale(form.language as Locale), 800);
      } else {
        setSaved(true);
        toast.success('Profile updated!');
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'G';

  return (
    <section style={{ ...cardStyle, overflow: 'hidden' }}>
      <div style={{
        padding: '22px 24px',
        background: 'linear-gradient(135deg, rgba(13,27,61,0.04), rgba(0,182,122,0.06))',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative' }}>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" style={{ width: '82px', height: '82px', borderRadius: '24px', objectFit: 'cover', border: '4px solid white', boxShadow: '0 14px 30px rgba(13,27,61,0.14)' }} />
          ) : (
            <div style={{ width: '82px', height: '82px', borderRadius: '24px', background: `linear-gradient(135deg, ${colors.green}, #027A63)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid white', boxShadow: '0 14px 30px rgba(13,27,61,0.14)' }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: '25px', fontFamily: 'Sora, sans-serif' }}>{initials}</span>
            </div>
          )}
          <button style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '30px', height: '30px', borderRadius: '11px', background: colors.gold, border: '3px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera style={{ width: '13px', height: '13px', color: colors.navy }} />
          </button>
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <p style={{ fontSize: '19px', fontWeight: 900, color: colors.navy, margin: '0 0 3px', fontFamily: 'Sora, sans-serif' }}>{user?.full_name ?? 'Your Name'}</p>
          <p style={{ fontSize: '13px', color: colors.muted, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail style={{ width: '14px', height: '14px' }} />
            {user?.email}
          </p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, padding: '6px 11px', borderRadius: '999px', background: 'white', color: colors.navy, border: `1px solid ${colors.border}` }}>
            <Crown style={{ width: '13px', height: '13px', color: colors.gold }} />
            Free Plan
          </span>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div className="settings-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <FieldLabel icon={User}>Full name</FieldLabel>
            <input type="text" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Kwame Mensah" style={inputStyle} onFocus={e => { e.target.style.borderColor = colors.gold; e.target.style.boxShadow = '0 0 0 4px rgba(245,166,35,0.12)'; }} onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; }} />
          </div>

          <div>
            <FieldLabel icon={Phone}>Phone</FieldLabel>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+233 24 123 4567" style={inputStyle} onFocus={e => { e.target.style.borderColor = colors.gold; e.target.style.boxShadow = '0 0 0 4px rgba(245,166,35,0.12)'; }} onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; }} />
          </div>

          <div>
            <FieldLabel icon={MapPin}>City</FieldLabel>
            <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Accra" style={inputStyle} onFocus={e => { e.target.style.borderColor = colors.gold; e.target.style.boxShadow = '0 0 0 4px rgba(245,166,35,0.12)'; }} onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; }} />
          </div>

          <div>
            <FieldLabel icon={Globe2}>Language</FieldLabel>
            <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }} onFocus={e => { e.target.style.borderColor = colors.gold; e.target.style.boxShadow = '0 0 0 4px rgba(245,166,35,0.12)'; }} onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; }}>
              {LOCALES.map(code => (
                <option key={code} value={code}>{LOCALE_NAMES[code]}</option>
              ))}
            </select>
            {form.language !== currentLocale && (
              <p style={{ fontSize: '12px', color: '#B7791F', margin: '7px 0 0', fontWeight: 700 }}>
                ⚡ App will switch to {LOCALE_NAMES[form.language as Locale]} after saving.
              </p>
            )}
          </div>
        </div>

        <PrimaryButton onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : saved ? <CheckCircle2 style={{ width: '16px', height: '16px' }} /> : <Save style={{ width: '16px', height: '16px' }} />}
          {loading ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
        </PrimaryButton>
      </div>
    </section>
  );
}

function ToggleSwitch({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: '48px', height: '28px', borderRadius: '999px', border: 'none', background: enabled ? colors.green : '#E5E7EB', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: '3px', width: '22px', height: '22px', borderRadius: '50%', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.18)', left: enabled ? '23px' : '3px', transition: 'left 0.2s' }} />
    </button>
  );
}

function NotifsTab() {
  const { user } = useAuthStore();
  const supabase = getSupabaseClient();
  const [prefs, setPrefs] = useState({
    location_alerts: true,
    health_alerts: true,
    geofence_alerts: true,
    push_enabled: true,
    email_enabled: false,
    sms_enabled: false,
    quiet_hours_on: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('notification_preferences').select('*').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setPrefs(data); });
  }, [user]);

  const toggle = (key: string) => setPrefs(p => ({ ...p, [key]: !(p as any)[key] }));

  const save = async () => {
    setLoading(true);
    await supabase.from('notification_preferences')
      .update({ ...prefs, updated_at: new Date().toISOString() })
      .eq('user_id', user!.id);
    toast.success('Notification preferences saved!');
    setLoading(false);
  };

  const toggles = [
    { key: 'push_enabled', label: 'Push notifications', sub: 'Alerts sent directly to your device', icon: Bell },
    { key: 'location_alerts', label: 'Location alerts', sub: 'When family members move or change zones', icon: MapPin },
    { key: 'health_alerts', label: 'Health alerts', sub: 'AI-detected anomalies and safety signals', icon: Shield },
    { key: 'geofence_alerts', label: 'Geofence alerts', sub: 'Enter and exit zone notifications', icon: Globe2 },
    { key: 'email_enabled', label: 'Email notifications', sub: 'Daily and weekly summary emails', icon: Mail },
    { key: 'sms_enabled', label: 'SMS notifications', sub: 'Important alerts by text message', icon: Phone },
    { key: 'quiet_hours_on', label: 'Quiet hours', sub: 'Mute non-urgent alerts from 10pm to 7am', icon: Bell },
  ];

  return (
    <section style={{ ...cardStyle, padding: '24px' }}>
      <div style={{ display: 'grid', gap: '12px' }}>
        {toggles.map(({ key, label, sub, icon: Icon }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '16px', borderRadius: '18px', border: `1px solid ${colors.border}`, background: (prefs as any)[key] ? 'rgba(0,182,122,0.045)' : 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '40px', height: '40px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.soft, color: colors.navy }}>
                <Icon style={{ width: '18px', height: '18px' }} />
              </span>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 900, color: colors.navy, margin: '0 0 3px' }}>{label}</p>
                <p style={{ fontSize: '12px', color: colors.muted, margin: 0 }}>{sub}</p>
              </div>
            </div>
            <ToggleSwitch enabled={(prefs as any)[key]} onClick={() => toggle(key)} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '18px' }}>
        <PrimaryButton onClick={save} disabled={loading} tone="green">
          {loading ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '16px', height: '16px' }} />}
          {loading ? 'Saving…' : 'Save preferences'}
        </PrimaryButton>
      </div>
    </section>
  );
}

function SecurityTab() {
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (newPass.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) toast.error(error.message);
    else {
      toast.success('Password updated!');
      setNewPass('');
    }
    setLoading(false);
  };

  return (
    <section style={{ ...cardStyle, padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ padding: '18px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(13,27,61,0.04), rgba(245,166,35,0.08))', border: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <LockKeyhole style={{ width: '18px', height: '18px', color: colors.gold }} />
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: colors.navy, fontFamily: 'Sora, sans-serif', margin: 0 }}>Change password</h3>
        </div>

        <div className="security-row" style={{ display: 'flex', gap: '10px' }}>
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New password (min. 8 chars)" style={{ ...inputStyle, flex: 1 }} onFocus={e => { e.target.style.borderColor = colors.navy; e.target.style.boxShadow = '0 0 0 4px rgba(13,27,61,0.10)'; }} onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none'; }} />
          <PrimaryButton onClick={handlePasswordChange} disabled={loading} tone="navy">
            {loading ? <Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> : <Shield style={{ width: '15px', height: '15px' }} />}
            Update
          </PrimaryButton>
        </div>
      </div>

      <div style={{ padding: '18px', borderRadius: '20px', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ width: '40px', height: '40px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', color: '#DC2626' }}>
            <Trash2 style={{ width: '18px', height: '18px' }} />
          </span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 900, color: '#DC2626', margin: '0 0 4px' }}>Delete account</p>
            <p style={{ fontSize: '12px', color: '#EF4444', margin: 0 }}>This will permanently delete all your data and cannot be undone.</p>
          </div>
        </div>
        <button style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626', background: 'white', border: '1px solid #FECACA', borderRadius: '12px', padding: '10px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
          Request deletion
        </button>
      </div>
    </section>
  );
}

function DevicesTab() {
  const { user } = useAuthStore();
  const [tokens, setTokens] = useState<any[]>([]);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('push_tokens').select('*').eq('user_id', user.id)
      .then(({ data }) => { if (data) setTokens(data); });
  }, [user]);

  return (
    <section style={{ ...cardStyle, padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 900, color: colors.navy, fontFamily: 'Sora, sans-serif', margin: '0 0 4px' }}>Registered devices</h3>
          <p style={{ fontSize: '13px', color: colors.muted, margin: 0 }}>Devices receiving GeoAfric push notifications.</p>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 900, padding: '8px 11px', borderRadius: '999px', background: colors.soft, color: colors.navy }}>
          {tokens.length} active
        </span>
      </div>

      {tokens.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '44px 22px', background: 'linear-gradient(135deg, #F9FAFB, #F3F7F5)', borderRadius: '22px', border: `1px dashed ${colors.border}` }}>
          <MonitorSmartphone style={{ width: '44px', height: '44px', color: '#D1D5DB', margin: '0 auto 10px' }} />
          <p style={{ fontSize: '14px', fontWeight: 800, color: colors.navy, margin: '0 0 4px' }}>No devices registered yet</p>
          <p style={{ fontSize: '12px', color: colors.muted, margin: 0 }}>Your phone or browser will appear here after push notifications are enabled.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {tokens.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '13px', padding: '14px', borderRadius: '18px', background: colors.soft, border: `1px solid ${colors.border}` }}>
              <span style={{ width: '42px', height: '42px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', color: colors.navy }}>
                <Smartphone style={{ width: '19px', height: '19px' }} />
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 900, color: colors.navy, margin: 0, textTransform: 'capitalize' }}>{t.platform}</p>
                <p style={{ fontSize: '12px', color: colors.muted, margin: '2px 0 0' }}>Last seen {new Date(t.last_seen).toLocaleDateString()}</p>
              </div>
              <button onClick={async () => {
                await supabase.from('push_tokens').delete().eq('id', t.id);
                setTokens(ts => ts.filter(x => x.id !== t.id));
                toast.success('Device removed.');
              }} style={{ fontSize: '12px', fontWeight: 800, color: '#EF4444', background: 'white', border: '1px solid #FECACA', borderRadius: '12px', padding: '9px 11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
