'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth.store';

const CALLBACK_TIMEOUT_MS = 12000;

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser, setToken, setRegistrationSuccessModal } = useAuthStore();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let settled = false;

    const timeoutId = setTimeout(() => {
      if (!settled) setTimedOut(true);
    }, CALLBACK_TIMEOUT_MS);

    const handleCallback = async () => {
      try {
        const urlObj = new URL(window.location.href);
        const code = urlObj.searchParams.get('code');
        const cookieMode = typeof document !== 'undefined'
          ? document.cookie.split('; ').find(row => row.startsWith('ga_oauth_mode='))?.split('=')[1]
          : null;
        const storedMode = typeof window !== 'undefined' ? sessionStorage.getItem('oauth_mode') : null;
        const oauthMode = storedMode || cookieMode || 'login';

        const storedNext = typeof window !== 'undefined' ? sessionStorage.getItem('oauth_next') : null;
        const storedReg  = typeof window !== 'undefined' ? sessionStorage.getItem('oauth_registered') : null;
        const nextParam = urlObj.searchParams.get('next') || storedNext;
        const isRegisteredFlag = urlObj.searchParams.get('registered') === '1' || storedReg === '1' || oauthMode === 'register';

        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('oauth_mode');
          sessionStorage.removeItem('oauth_next');
          sessionStorage.removeItem('oauth_registered');
          document.cookie = 'ga_oauth_mode=; path=/; max-age=0';
        }

        let session = null;

        // Exchange the code in the URL for a session
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Code exchange error:', error.message);
          } else {
            session = data.session;
          }
        }

        // Fallback: check if session was established via hash fragment or cookie
        if (!session) {
          const { data } = await supabase.auth.getSession();
          session = data.session;
        }

        if (!session) {
          console.error('Callback error: No session found');
          window.location.replace('/auth/login?error=callback_failed');
          return;
        }

        const u = session.user;

        // Check if user is registered in the database (profiles table)
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, onboarded')
          .eq('id', u.id)
          .maybeSingle();

        const isRegisteredInDb = !!profile;

        // If clicked from Sign In page, but account is NOT in the database:
        if (oauthMode === 'login' && !isRegisteredInDb) {
          await supabase.auth.signOut();
          setUser(null);
          setToken(null);
          window.location.replace('/auth/login?error=not_registered');
          return;
        }

        // If clicked from Register page, use Google details to register user into database
        const fullName = profile?.full_name || u.user_metadata?.full_name || u.user_metadata?.name || '';
        const avatarUrl = u.user_metadata?.avatar_url || u.user_metadata?.picture || null;
        let needsOnboarding = !profile?.onboarded;

        if (oauthMode === 'register' || !isRegisteredInDb) {
          await supabase.from('profiles').upsert({
            id: u.id,
            full_name: fullName,
            avatar_url: avatarUrl,
            onboarded: false,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

          needsOnboarding = true;
          setRegistrationSuccessModal(true);
        } else if (isRegisteredFlag) {
          setRegistrationSuccessModal(true);
        }

        setUser({
          id: u.id,
          email: u.email ?? '',
          full_name: fullName,
          avatar_url: avatarUrl,
          phone: u.user_metadata?.phone ?? null,
          provider: 'google',
        });
        setToken(session.access_token);

        const defaultTarget = needsOnboarding ? '/onboarding' : '/dashboard';
        const target = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('/auth')
          ? nextParam
          : defaultTarget;

        window.location.replace(target);
      } catch (err) {
        console.error('Callback exception:', err);
        window.location.replace('/auth/login');
      } finally {
        settled = true;
        clearTimeout(timeoutId);
      }
    };

    handleCallback();

    return () => clearTimeout(timeoutId);
  }, []);

  if (timedOut) {
    return (
      <div style={{
        minHeight: '100vh', width: '100vw',
        background: 'linear-gradient(135deg, #0D1B3D 0%, #0D2B5E 55%, #0D1B3D 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '16px', padding: '24px', textAlign: 'center',
      }}>
        <img
          src="/brand/logo-icon.png"
          alt="GeoAfric"
          style={{ width: '56px', height: '56px', objectFit: 'contain', opacity: 0.6 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <p style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: 0 }}>
          Sign-in is taking longer than expected
        </p>
        <p style={{ color: '#93C5FD', fontSize: '14px', margin: 0, maxWidth: '360px' }}>
          We couldn&apos;t complete sign-in. This link may have expired or already been used.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={() => window.location.reload()}
            style={{ padding: '12px 24px', borderRadius: '12px', border: 'none',
              background: '#F5A623', color: '#0D1B3D', fontWeight: '700', fontSize: '14px',
              cursor: 'pointer', fontFamily: 'inherit' }}>
            Retry
          </button>
          <Link href="/auth/login"
            style={{ padding: '12px 24px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.3)',
              color: 'white', fontWeight: '700', fontSize: '14px', textDecoration: 'none' }}>
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      background: 'linear-gradient(135deg, #0D1B3D 0%, #0D2B5E 55%, #0D1B3D 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: '16px',
    }}>
      <img
        src="/brand/logo-icon.png"
        alt="GeoAfric"
        style={{ width: '64px', height: '64px', objectFit: 'contain',
          animation: 'pulse 1.5s ease-in-out infinite',
          filter: 'drop-shadow(0 4px 20px rgba(245,166,35,0.5))' }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      <p style={{ color: '#93C5FD', fontSize: '15px', fontWeight: '500' }}>
        Signing you in…
      </p>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.92)} }
      `}</style>
    </div>
  );
}