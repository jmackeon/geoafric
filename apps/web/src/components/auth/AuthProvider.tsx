'use client';

import { useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth.store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setToken, setLoading, logout } = useAuthStore();
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
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []); // empty deps — run once only

  return <>{children}</>;
}