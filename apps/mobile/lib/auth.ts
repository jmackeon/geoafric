import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@geoafric/shared';
import { api, tokenStorage } from './api';

export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, user, setUser, setLoading } = useAuthStore();

  // ── Hydrate session on app start ─────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await tokenStorage.getToken();
        if (!token) {
          if (mounted) setLoading(false);
          return;
        }
        const { data } = await api.get('/auth/me');
        if (mounted) setUser(data);
      } catch {
        await tokenStorage.setToken(null);
        if (mounted) setUser(null);
      }
    })();
    return () => { mounted = false; };
  }, [setUser, setLoading]);

  // ── Route guarding ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup    = segments[0] === 'auth';
    const inOnboarding   = segments[0] === 'onboarding';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      if (!user?.onboarded) router.replace('/onboarding');
      else router.replace('/(tabs)');
    } else if (isAuthenticated && !user?.onboarded && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, isLoading, segments, user?.onboarded, router]);
}
