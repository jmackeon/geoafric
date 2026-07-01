import { create } from 'zustand';
import { familiesApi } from '@/lib/api/families';

export interface FamilyMember {
  id: string;
  role: 'owner' | 'admin' | 'member';
  nickname: string | null;
  joined_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  };
}

export interface Family {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
  family_members: FamilyMember[];
}

export interface GeofenceZone {
  id: string;
  family_id: string;
  name: string;
  lat: number;
  lng: number;
  radius_m: number;
  alert_on: string[];
  created_at: string;
}

interface FamilyState {
  families: Family[];
  activeFamily: Family | null;
  geofences: GeofenceZone[];
  loading: boolean;
  error: string | null;

  fetchFamilies: () => Promise<void>;
  fetchFamily: (id: string) => Promise<void>;
  setActiveFamily: (family: Family | null) => void;
  fetchGeofences: (familyId: string) => Promise<void>;
  reset: () => void;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  families:     [],
  activeFamily: null,
  geofences:    [],
  loading:      false,
  error:        null,

  fetchFamilies: async () => {
    set({ loading: true, error: null });
    try {
      const res = await familiesApi.getAll();
      // API returns [{role, joined_at, families: {...}}]
      const families = res.data.map((m: any) => m.families).filter(Boolean);
      set({ families, loading: false });
      // Auto-select first family
      if (families.length > 0 && !get().activeFamily) {
        set({ activeFamily: families[0] });
      }
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  fetchFamily: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await familiesApi.getOne(id);
      set({ activeFamily: res.data, loading: false });
      // Update in list too
      set((s) => ({
        families: s.families.map((f) => f.id === id ? res.data : f),
      }));
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  setActiveFamily: (family) => set({ activeFamily: family }),

  fetchGeofences: async (familyId: string) => {
    try {
      const res = await familiesApi.getGeofences(familyId);
      set({ geofences: res.data });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  reset: () => set({ families: [], activeFamily: null, geofences: [], loading: false, error: null }),
}));