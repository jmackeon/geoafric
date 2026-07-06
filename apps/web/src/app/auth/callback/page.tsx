'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth.store';

const CALLBACK_TIMEOUT_MS = 12000;

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let settled = false;

    const timeoutId = setTimeout(() => {
      if (!settled) setTimedOut(true);
    }, CALLBACK_TIMEOUT_MS);

    const handleCallback = async () => {
      try {
        // Exchange the code in the URL for a session
        // This handles email confirmation links and OAuth redirects
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );

        if (error || !data.session) {
          console.error('Callback error:', error?.message);
          router.replace('/auth/login?error=callback_failed');
          return;
        }

        const u = data.session.user;
        setUser({
          id: u.id,
          email: u.email ?? '',
          full_name: u.user_metadata?.full_name ?? null,
          avatar_url: u.user_metadata?.avatar_url ?? null,
          phone: u.user_metadata?.phone ?? null,
          provider: u.app_metadata?.provider ?? 'email',
        });
        setToken(data.session.access_token);

        // Check onboarding status
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', u.id)
          .single();

        router.refresh();
        setTimeout(() => {
          router.replace(profile?.onboarded ? '/dashboard' : '/onboarding');
        }, 100);

      } catch (err) {
        console.error('Callback exception:', err);
        router.replace('/auth/login');
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
          We couldn't complete sign-in. This link may have expired or already been used.
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