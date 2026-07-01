import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSupabaseClient } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  provider: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      loading: false, // false by default — AuthProvider sets true only while checking

      setUser:    (user)          => set({ user }),
      setToken:   (accessToken)   => set({ accessToken }),
      setLoading: (loading)       => set({ loading }),

      logout: async () => {
        try {
          const supabase = getSupabaseClient();
          await supabase.auth.signOut();
        } catch {}
        set({ user: null, accessToken: null });
      },

      refreshUser: async () => {
        set({ loading: true });
        try {
          const supabase = getSupabaseClient();
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            const u = data.session.user;
            set({
              user: {
                id: u.id,
                email: u.email ?? '',
                full_name: u.user_metadata?.full_name ?? null,
                avatar_url: u.user_metadata?.avatar_url ?? null,
                phone: u.user_metadata?.phone ?? null,
                provider: u.app_metadata?.provider ?? 'email',
              },
              accessToken: data.session.access_token,
            });
          } else {
            set({ user: null, accessToken: null });
          }
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'geoafric-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    },
  ),
);