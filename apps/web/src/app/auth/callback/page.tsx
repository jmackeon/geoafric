'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth.store';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    const supabase = getSupabaseClient();

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
      }
    };

    handleCallback();
  }, []);

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