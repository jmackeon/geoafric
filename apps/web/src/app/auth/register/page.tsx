'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSupabaseClient } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.full_name, phone: form.phone || null },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      if (data.user && !data.session) {
        toast.success('Account created! Check your email to confirm before signing in.');
        router.push('/auth/login');
      } else if (data.session) {
        toast.success('Account created! Welcome to GeoAfric 🎉');
        router.push('/onboarding');
      }
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('already registered')) toast.error('This email is already registered. Try signing in.');
      else toast.error(msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message ?? 'Google sign-up failed.');
      setGoogleLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px 12px 40px',
    borderRadius: '12px',
    border: '1.5px solid #E5E7EB',
    fontSize: '14px',
    color: '#0D1B3D',
    background: 'white',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  return (
    <>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #0D1B3D 0%, #0D2B5E 55%, #0D1B3D 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Orbs */}
        <div style={{
          position: 'fixed', top: '-80px', right: '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,230,210,0.08) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'fixed', bottom: '-100px', left: '-80px',
          width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,166,35,0.10) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <img
              src="/brand/logo-icon.png"
              alt="GeoAfric"
              style={{ width: '68px', height: '68px', objectFit: 'contain', marginBottom: '10px',
                filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))',
                animation: 'float 3s ease-in-out infinite' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <img
              src="/brand/logo-text.png"
              alt="GeoAfric"
              style={{ width: '200px', height: 'auto', objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <p style={{ color: '#93C5FD', fontSize: '13px', marginTop: '8px' }}>
              Create your family account
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'white', borderRadius: '24px', padding: '28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', padding: '12px 16px', borderRadius: '14px',
                border: '2px solid #E5E7EB', background: 'white', cursor: 'pointer',
                fontWeight: '600', fontSize: '14px', color: '#0D1B3D', marginBottom: '18px',
                opacity: googleLoading ? 0.65 : 1, fontFamily: 'inherit' }}
            >
              <svg style={{ width: '18px', height: '18px', flexShrink: 0 }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>or register with email</span>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Full name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '5px' }}>
                  Full name
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: '15px', height: '15px', color: '#9CA3AF', pointerEvents: 'none' }} />
                  <input type="text" value={form.full_name} onChange={update('full_name')}
                    placeholder="Kwame Mensah" required style={inputBase}
                    onFocus={e => { e.target.style.borderColor = '#F5A623'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)'; }}
                    onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '5px' }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: '15px', height: '15px', color: '#9CA3AF', pointerEvents: 'none' }} />
                  <input type="email" value={form.email} onChange={update('email')}
                    placeholder="you@example.com" required style={inputBase}
                    onFocus={e => { e.target.style.borderColor = '#F5A623'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)'; }}
                    onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '5px' }}>
                  Phone <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: '15px', height: '15px', color: '#9CA3AF', pointerEvents: 'none' }} />
                  <input type="tel" value={form.phone} onChange={update('phone')}
                    placeholder="+233 24 123 4567" style={inputBase}
                    onFocus={e => { e.target.style.borderColor = '#F5A623'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)'; }}
                    onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '5px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: '15px', height: '15px', color: '#9CA3AF', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Min. 8 characters"
                    required
                    style={{ ...inputBase, paddingRight: '44px' }}
                    onFocus={e => { e.target.style.borderColor = '#F5A623'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)'; }}
                    onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
                      padding: '4px', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword
                      ? <EyeOff style={{ width: '15px', height: '15px' }} />
                      : <Eye style={{ width: '15px', height: '15px' }} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                  background: '#F5A623', color: '#0D1B3D', fontWeight: '700', fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(245,166,35,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: loading ? 0.75 : 1, marginTop: '4px', fontFamily: 'inherit' }}
              >
                {loading && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', margin: '12px 0 0' }}>
              By signing up you agree to our{' '}
              <Link href="/legal/terms" style={{ textDecoration: 'underline', color: '#9CA3AF' }}>Terms</Link>
              {' '}and{' '}
              <Link href="/legal/privacy" style={{ textDecoration: 'underline', color: '#9CA3AF' }}>Privacy Policy</Link>.
            </p>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', margin: '10px 0 0' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ fontWeight: '700', color: '#0D1B3D', textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>

          {/* Tagline */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#93C5FD', fontSize: '11px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: '600', margin: '0 0 8px' }}>
              Connecting People. Protecting What Matters.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '10px', fontSize: '11px', fontWeight: '800' }}>
              <span style={{ color: '#00E6D2' }}>INTELLIGENCE</span>
              <span style={{ color: '#1E3A7A' }}>·</span>
              <span style={{ color: '#00B67A' }}>INFRASTRUCTURE</span>
              <span style={{ color: '#1E3A7A' }}>·</span>
              <span style={{ color: '#F5A623' }}>ENTERPRISE</span>
              <span style={{ color: '#1E3A7A' }}>·</span>
              <span style={{ color: '#00E6D2' }}>AFRICA</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}