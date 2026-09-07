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

    // Initial session check
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