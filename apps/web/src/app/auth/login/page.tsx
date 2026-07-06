'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const u = data.user;
      setUser({
        id: u.id, email: u.email ?? '',
        full_name: u.user_metadata?.full_name ?? null,
        avatar_url: u.user_metadata?.avatar_url ?? null,
        phone: u.user_metadata?.phone ?? null,
        provider: 'email',
      });
      setToken(data.session.access_token);
      toast.success('Welcome back!');
      window.location.replace('/dashboard');
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('Invalid login')) toast.error('Incorrect email or password.');
      else if (msg.includes('Email not confirmed')) toast.error('Please confirm your email first.');
      else toast.error(msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      toast.error(err.message ?? 'Google login failed. Check OAuth settings.');
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      <div className="auth-page" style={{
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
        {/* Decorative orbs — fixed, never interact */}
        <div style={{
          position: 'fixed', top: '-100px', left: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'fixed', bottom: '-120px', right: '-120px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,230,210,0.08) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
            <img src="/brand/logo-icon.png" alt="GeoAfric"
              style={{ width: '72px', height: '72px', objectFit: 'contain', marginBottom: '12px',
                filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))',
                animation: 'float 3s ease-in-out infinite' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <img src="/brand/logo-text.png" alt="GeoAfric"
              style={{ width: '210px', height: 'auto', objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <p style={{ color: '#93C5FD', fontSize: '14px', marginTop: '10px', letterSpacing: '0.02em' }}>
              Sign in to your account
            </p>
          </div>

          {/* White card */}
          <div style={{
            background: 'white', borderRadius: '24px', padding: '32px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}>
            {/* Google SSO */}
            <button type="button" onClick={handleGoogleLogin} disabled={googleLoading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', padding: '13px 16px', borderRadius: '14px',
                border: '2px solid #E5E7EB', background: 'white', cursor: 'pointer',
                fontWeight: '600', fontSize: '14px', color: '#0D1B3D', marginBottom: '20px',
                transition: 'border-color 0.2s', opacity: googleLoading ? 0.65 : 1 }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#D1D5DB')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
            >
              {googleLoading
                ? <svg style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#0D1B3D" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                : <svg style={{ width: '18px', height: '18px', flexShrink: 0 }} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
              }
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>or sign in with email</span>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '6px' }}>
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: '16px', height: '16px', color: '#9CA3AF', pointerEvents: 'none' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required autoComplete="email"
                    style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px',
                      border: '1.5px solid #E5E7EB', fontSize: '14px', color: '#0D1B3D',
                      background: 'white', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#F5A623'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)'; }}
                    onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0D1B3D', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    width: '16px', height: '16px', color: '#9CA3AF', pointerEvents: 'none' }} />
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required autoComplete="current-password"
                    style={{ width: '100%', padding: '12px 44px 12px 40px', borderRadius: '12px',
                      border: '1.5px solid #E5E7EB', fontSize: '14px', color: '#0D1B3D',
                      background: 'white', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#F5A623'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)'; }}
                    onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px',
                      display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '-4px' }}>
                <Link href="/auth/forgot-password"
                  style={{ fontSize: '13px', fontWeight: '600', color: '#F5A623', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                  background: '#F5A623', color: '#0D1B3D', fontWeight: '700', fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(245,166,35,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: loading ? 0.75 : 1, transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#D48A0A'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F5A623'; }}
              >
                {loading && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', marginTop: '20px', marginBottom: 0 }}>
              Don't have an account?{' '}
              <Link href="/auth/register" style={{ fontWeight: '700', color: '#0D1B3D', textDecoration: 'none' }}>
                Create one
              </Link>
            </p>
          </div>

          {/* Tagline */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
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
            <p style={{ color: '#60A5FA', fontSize: '11px', margin: '8px 0 0' }}>
              Alpha-Z Technologies © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}