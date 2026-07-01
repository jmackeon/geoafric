'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Phone, Shield, MapPin,
  ChevronRight, ChevronLeft, Loader2, CheckCircle2, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSupabaseClient } from '@/lib/supabase';
import { usersApi } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth.store';

const STEPS = [
  { id: 1, label: 'Profile',   icon: User,   title: 'Tell us about yourself',    sub: 'Help us personalise your experience' },
  { id: 2, label: 'Location',  icon: MapPin, title: 'Where are you based?',       sub: 'Used to show nearby places and alerts' },
  { id: 3, label: 'Emergency', icon: Shield, title: 'Emergency contact',          sub: 'Who should we contact in an emergency?' },
  { id: 4, label: 'Family',    icon: Users,  title: 'Set up your family group',   sub: 'Invite members or skip for now' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'fr', label: 'Français' },
  { code: 'tw', label: 'Twi' },    { code: 'ha', label: 'Hausa' },
  { code: 'yo', label: 'Yorùbá' }, { code: 'sw', label: 'Kiswahili' },
  { code: 'am', label: 'አማርኛ' },  { code: 'ar', label: 'العربية' },
];

const COUNTRIES = [
  { code: 'GH', label: '🇬🇭 Ghana' },    { code: 'NG', label: '🇳🇬 Nigeria' },
  { code: 'KE', label: '🇰🇪 Kenya' },    { code: 'ZA', label: '🇿🇦 South Africa' },
  { code: 'SN', label: '🇸🇳 Senegal' },  { code: 'ET', label: '🇪🇹 Ethiopia' },
  { code: 'CI', label: "🇨🇮 Côte d'Ivoire" }, { code: 'MA', label: '🇲🇦 Morocco' },
  { code: 'EG', label: '🇪🇬 Egypt' },    { code: 'TZ', label: '🇹🇿 Tanzania' },
];

interface FormData {
  full_name: string; phone: string; date_of_birth: string; gender: string; language: string;
  country: string; city: string;
  emergency_name: string; emergency_phone: string;
  family_name: string; skip_family: boolean;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: '10px',
  border: '1.5px solid #E5E7EB', fontSize: '14px', color: '#0D1B3D',
  background: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

export default function OnboardingPage() {
  const router  = useRouter();
  const { user, setUser } = useAuthStore();
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState<FormData>({
    full_name: user?.full_name ?? '', phone: user?.phone ?? '',
    date_of_birth: '', gender: '', language: 'en',
    country: 'GH', city: '',
    emergency_name: '', emergency_phone: '',
    family_name: '', skip_family: false,
  });
  const [loading, setLoading] = useState(false);

  const update = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const next = () => setStep(s => Math.min(s + 1, 4));
  const back = () => setStep(s => Math.max(s - 1, 1));

  const handleComplete = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      // Update profile via API
      await usersApi.updateProfile({
        full_name: form.full_name,
        phone:     form.phone,
        language:  form.language,
      });

      // Update extended fields directly in Supabase
      await supabase.from('profiles').update({
        date_of_birth:   form.date_of_birth || null,
        gender:          form.gender || null,
        country:         form.country,
        city:            form.city || null,
        emergency_name:  form.emergency_name || null,
        emergency_phone: form.emergency_phone || null,
        onboarded:       true,
        onboarding_step: 4,
        updated_at:      new Date().toISOString(),
      }).eq('id', user!.id);

      // Create family if requested
      if (!form.skip_family && form.family_name.trim()) {
        await supabase.from('families').insert({
          name: form.family_name.trim(), owner_id: user!.id,
        });
      }

      setUser({ ...user!, full_name: form.full_name });
      toast.success('Welcome to GeoAfric! 🌍');
      window.location.replace('/dashboard');
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const currentStep = STEPS[step - 1];

  return (
    <>
      <style>{`
        html, body { background: #0D1B3D !important; margin: 0; padding: 0; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        minHeight: '100vh', width: '100vw',
        background: 'linear-gradient(135deg, #0D1B3D 0%, #0D2B5E 55%, #0D1B3D 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Orbs */}
        <div style={{ position: 'fixed', top: '-80px', left: '-80px', width: '350px', height: '350px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.10) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '-100px', right: '-80px', width: '400px', height: '400px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,230,210,0.07) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '500px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <img src="/brand/logo-icon.png" alt="GeoAfric"
              style={{ width: '56px', height: '56px', objectFit: 'contain', marginBottom: '8px',
                filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))', animation: 'float 3s ease-in-out infinite' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <img src="/brand/logo-text.png" alt="GeoAfric"
              style={{ width: '160px', height: 'auto', objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <p style={{ color: '#93C5FD', fontSize: '12px', marginTop: '6px' }}>
              Step {step} of {STEPS.length}
            </p>
          </div>

          {/* Step progress icons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '0 4px' }}>
            {STEPS.map(({ id, label, icon: Icon }) => {
              const done   = id < step;
              const active = id === step;
              return (
                <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? '#00B67A' : active ? '#F5A623' : 'rgba(255,255,255,0.1)',
                    boxShadow: active ? '0 0 16px rgba(245,166,35,0.5)' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {done
                      ? <CheckCircle2 style={{ width: '18px', height: '18px', color: 'white' }} />
                      : <Icon style={{ width: '18px', height: '18px', color: active ? '#0D1B3D' : 'rgba(255,255,255,0.5)' }} />
                    }
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '600',
                    color: active ? '#F5A623' : done ? '#00B67A' : 'rgba(255,255,255,0.4)' }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '20px' }}>
            <div style={{ height: '100%', borderRadius: '2px', width: `${progress}%`,
              background: 'linear-gradient(90deg, #F5A623, #00E6D2)', transition: 'width 0.4s ease' }} />
          </div>

          {/* Card */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>

            {/* Step header */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0D1B3D',
                fontFamily: 'Sora, sans-serif', margin: '0 0 4px' }}>
                {currentStep.title}
              </h2>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>{currentStep.sub}</p>
            </div>

            {/* Step content */}
            {step === 1 && <StepProfile form={form} update={update} setForm={setForm} />}
            {step === 2 && <StepLocation form={form} update={update} />}
            {step === 3 && <StepEmergency form={form} update={update} />}
            {step === 4 && <StepFamily form={form} update={update} setForm={setForm} />}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px',
              paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
              {step > 1 && (
                <button onClick={back} style={{
                  flex: 1, padding: '13px', borderRadius: '14px',
                  border: '2px solid #0D1B3D', background: 'white', color: '#0D1B3D',
                  fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontFamily: 'inherit',
                }}>
                  <ChevronLeft style={{ width: '16px', height: '16px' }} /> Back
                </button>
              )}

              {step < 4 ? (
                <button onClick={next} style={{
                  flex: 1, padding: '13px', borderRadius: '14px', border: 'none',
                  background: '#F5A623', color: '#0D1B3D', fontWeight: '700', fontSize: '14px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px', boxShadow: '0 4px 16px rgba(245,166,35,0.4)',
                  fontFamily: 'inherit',
                }}>
                  Continue <ChevronRight style={{ width: '16px', height: '16px' }} />
                </button>
              ) : (
                <button onClick={handleComplete} disabled={loading} style={{
                  flex: 1, padding: '13px', borderRadius: '14px', border: 'none',
                  background: loading ? '#D48A0A' : '#F5A623', color: '#0D1B3D',
                  fontWeight: '700', fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  boxShadow: '0 4px 16px rgba(245,166,35,0.4)', fontFamily: 'inherit',
                  opacity: loading ? 0.8 : 1,
                }}>
                  {loading
                    ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Saving…</>
                    : <><CheckCircle2 style={{ width: '16px', height: '16px' }} /> Complete Setup</>
                  }
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', color: '#60A5FA', fontSize: '11px', marginTop: '16px' }}>
            Alpha Z Technologies © {new Date().getFullYear()} · GeoAfric Platform
          </p>
        </div>

        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    </>
  );
}

// ── Step 1: Profile ───────────────────────────────────────────────────────────
function StepProfile({ form, update, setForm }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '5px' }}>Full name</label>
        <div style={{ position: 'relative' }}>
          <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#9CA3AF', pointerEvents: 'none' }} />
          <input type="text" value={form.full_name} onChange={update('full_name')}
            placeholder="Kwame Mensah" style={{ ...inputStyle, paddingLeft: '38px' }}
            onFocus={e => { e.target.style.borderColor = '#F5A623'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)'; }}
            onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '5px' }}>Date of birth</label>
          <input type="date" value={form.date_of_birth} onChange={update('date_of_birth')} style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#F5A623'; }}
            onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '5px' }}>Gender</label>
          <select value={form.gender} onChange={update('gender')} style={inputStyle}>
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '5px' }}>Phone number</label>
        <div style={{ position: 'relative' }}>
          <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#9CA3AF', pointerEvents: 'none' }} />
          <input type="tel" value={form.phone} onChange={update('phone')}
            placeholder="+233 24 123 4567" style={{ ...inputStyle, paddingLeft: '38px' }}
            onFocus={e => { e.target.style.borderColor = '#F5A623'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)'; }}
            onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '8px' }}>Preferred language</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {LANGUAGES.map(({ code, label }) => (
            <button key={code} type="button"
              onClick={() => setForm((f: any) => ({ ...f, language: code }))}
              style={{ padding: '7px 4px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                border: `2px solid ${form.language === code ? '#F5A623' : '#E5E7EB'}`,
                background: form.language === code ? '#FEF5E7' : 'white',
                color: form.language === code ? '#D48A0A' : '#6B7280',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Location ──────────────────────────────────────────────────────────
function StepLocation({ form, update }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '5px' }}>Country</label>
        <select value={form.country} onChange={update('country')} style={inputStyle}>
          {COUNTRIES.map(({ code, label }) => (
            <option key={code} value={code}>{label}</option>
          ))}
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '5px' }}>City / Town</label>
        <input type="text" value={form.city} onChange={update('city')}
          placeholder="e.g. Accra, Kumasi, Takoradi" style={inputStyle}
          onFocus={e => { e.target.style.borderColor = '#F5A623'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)'; }}
          onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
      </div>
      <div style={{ padding: '12px', borderRadius: '12px', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <MapPin style={{ width: '15px', height: '15px', color: '#3B82F6', marginTop: '1px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#1D4ED8', margin: '0 0 2px' }}>GPS Location</p>
            <p style={{ fontSize: '11px', color: '#3B82F6', margin: 0 }}>
              Precise GPS tracking activates in Phase 2. This sets your default map region.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Emergency ─────────────────────────────────────────────────────────
function StepEmergency({ form, update }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ padding: '12px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <Shield style={{ width: '15px', height: '15px', color: '#EF4444', marginTop: '1px', flexShrink: 0 }} />
          <p style={{ fontSize: '12px', color: '#DC2626', margin: 0 }}>
            This contact will be notified if a health alert or SOS is triggered. You can update this anytime in Settings.
          </p>
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '5px' }}>Contact name</label>
        <input type="text" value={form.emergency_name} onChange={update('emergency_name')}
          placeholder="e.g. Abena Mensah" style={inputStyle}
          onFocus={e => { e.target.style.borderColor = '#F5A623'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)'; }}
          onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '5px' }}>Contact phone</label>
        <input type="tel" value={form.emergency_phone} onChange={update('emergency_phone')}
          placeholder="+233 24 123 4567" style={inputStyle}
          onFocus={e => { e.target.style.borderColor = '#F5A623'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)'; }}
          onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
      </div>
      <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Both fields are optional — you can fill them in later under Settings.</p>
    </div>
  );
}

// ── Step 4: Family ────────────────────────────────────────────────────────────
function StepFamily({ form, update, setForm }: any) {
  if (form.skip_family) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Users style={{ width: '32px', height: '32px', color: '#9CA3AF' }} />
        </div>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
          No problem! You can create or join a family group anytime from your dashboard.
        </p>
        <button type="button"
          onClick={() => setForm((f: any) => ({ ...f, skip_family: false }))}
          style={{ fontSize: '13px', color: '#0D1B3D', fontWeight: '600', background: 'none',
            border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
          Actually, I'll set one up now
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '5px' }}>Family group name</label>
        <input type="text" value={form.family_name} onChange={update('family_name')}
          placeholder="e.g. The Mensah Family" style={inputStyle}
          onFocus={e => { e.target.style.borderColor = '#F5A623'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)'; }}
          onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
      </div>
      <div style={{ padding: '12px', borderRadius: '12px', background: '#FEF5E7', border: '1px solid #FDE68A' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <Users style={{ width: '15px', height: '15px', color: '#D97706', marginTop: '1px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#92400E', margin: '0 0 2px' }}>Invite members</p>
            <p style={{ fontSize: '11px', color: '#B45309', margin: 0 }}>
              After setup, you'll get a unique invite code to share with family members.
            </p>
          </div>
        </div>
      </div>
      <button type="button"
        onClick={() => setForm((f: any) => ({ ...f, skip_family: true }))}
        style={{ fontSize: '13px', color: '#9CA3AF', background: 'none', border: 'none',
          cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', textAlign: 'left' }}>
        Skip for now — I'll set up family later
      </button>
    </div>
  );
}