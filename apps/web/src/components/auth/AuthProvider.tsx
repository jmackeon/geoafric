'use client';

import { useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth.store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use individual selectors — subscribing to the whole store (`useAuthStore()`) causes
  // AuthProvider (and its entire subtree) to re-render on every store mutation, including
  // the loading=true → loading=false flip on every page load. Selectors scope each
  // subscription to a single slice so the component only re-renders when that value changes.
  const setUser    = useAuthStore(s => s.setUser);
  const setToken   = useAuthStore(s => s.setToken);
  const setLoading = useAuthStore(s => s.setLoading);
  // NOTE: logout() is intentionally NOT used here — see onAuthStateChange comment below.
  const initialized = useRef(false);

  useEffect(() => {
    // Guard: only run once
    if (initialized.current) return;
    initialized.current = true;

    const supabase = getSupabaseClient();

    // Helper to process OAuth session based on login vs register mode
    const processOAuthSession = async (session: any) => {
      const u = session.user;
      const cookieMode = typeof document !== 'undefined'
        ? document.cookie.split('; ').find(row => row.startsWith('ga_oauth_mode='))?.split('=')[1]
        : null;
      const storedMode = typeof window !== 'undefined' ? sessionStorage.getItem('oauth_mode') : null;
      const oauthMode = storedMode || cookieMode || 'login';

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('oauth_mode');
        sessionStorage.removeItem('oauth_next');
        sessionStorage.removeItem('oauth_registered');
        document.cookie = 'ga_oauth_mode=; path=/; max-age=0';
      }

      // Check if user is registered in the database (profiles table)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, onboarded')
        .eq('id', u.id)
        .maybeSingle();

      const isRegisteredInDb = !!profile;

      // Condition 1: Sign in clicked on Login page, but user is NOT registered in database
      if (oauthMode === 'login' && !isRegisteredInDb) {
        await supabase.auth.signOut();
        setUser(null);
        setToken(null);
        window.location.replace('/auth/login?error=not_registered');
        return;
      }

      // Condition 2: Sign in clicked on Register page OR already registered
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
        useAuthStore.getState().setRegistrationSuccessModal(true);
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
      window.location.replace(needsOnboarding ? '/onboarding' : '/dashboard');
    };

    // 1. Check if we arrived with an OAuth code parameter (?code=xxxx) on any URL outside /auth/callback
    // (If on /auth/callback, AuthCallbackPage handles the code exchange and profile registration checks exclusively)
    if (typeof window !== 'undefined' && window.location.pathname !== '/auth/callback') {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        setLoading(true);
        supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
          if (!error && data.session) {
            processOAuthSession(data.session);
          } else {
            setLoading(false);
          }
        }).catch(() => setLoading(false));
        return;
      }
    }

    // 2. Initial session check (also catches hash fragment tokens #access_token=...)
    setLoading(true);
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
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

        // If URL has OAuth hash tokens outside of /auth/callback, process OAuth verification
        if (typeof window !== 'undefined' && window.location.pathname !== '/auth/callback' && window.location.hash.includes('access_token')) {
          processOAuthSession(data.session);
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    // Subscribe to auth changes (login/logout/refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const u = session.user;
        setUser({
          id: u.id,
          email: u.email ?? '',
          full_name: u.user_metadata?.full_name ?? null,
          avatar_url: u.user_metadata?.avatar_url ?? null,
          phone: u.user_metadata?.phone ?? null,
          provider: u.app_metadata?.provider ?? 'email',
        });
        setToken(session.access_token);
      } else {
        // IMPORTANT: Do NOT call logout() here.
        // logout() calls supabase.auth.signOut(), which emits a SIGNED_OUT event,
        // which fires this callback again with session=null, which calls logout() again…
        // That's an infinite async loop that saturates the event queue and freezes the page.
        // Simply clear local state — the signOut() call belongs only in the user-facing
        // logout button (DashboardLayout), not in a reactive auth listener.
        setUser(null);
        setToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // empty deps — run once only

  return <>{children}</>;
}