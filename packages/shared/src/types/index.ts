// ── Auth & Users ─────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  preferred_language: string;
  onboarded: boolean;
  created_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: UserProfile;
}

// ── Family ───────────────────────────────────────────────────────────────────
export interface Family {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  owner_id: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  family_id: string;
  role: 'owner' | 'admin' | 'guardian' | 'member';
  joined_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

// ── Location ─────────────────────────────────────────────────────────────────
export interface LocationUpdate {
  user_id: string;
  lat: number;
  lng: number;
  accuracy?: number;
  battery?: number;
  recorded_at: string;
}

// ── Health ───────────────────────────────────────────────────────────────────
export interface HeartRateReading {
  id: string;
  user_id: string;
  bpm: number;
  recorded_at: string;
}

export interface HealthInsight {
  id: string;
  type: 'tip' | 'alert' | 'achievement';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

// ── Places ───────────────────────────────────────────────────────────────────
export interface SavedPlace {
  id: string;
  google_place_id: string;
  name: string;
  address: string | null;
  category: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  visited: boolean;
}

// ── Payments ─────────────────────────────────────────────────────────────────
export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string;
  price_monthly_usd: number;
  price_annual_usd: number;
  max_members: number | null;
  features: string[];
}

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trial';
  billing_cycle: 'monthly' | 'annual';
  current_period_end: string;
  plans?: Plan;
}

// ── SolarTrack ───────────────────────────────────────────────────────────────
export interface SolarDevice {
  id: string;
  serial_number: string;
  name: string;
  is_online: boolean;
  last_seen: string | null;
  panel_capacity_w: number | null;
  battery_capacity_wh: number | null;
}

// ── Brand tokens (shared web + mobile) ───────────────────────────────────────
export const BRAND = {
  navy:  '#080F20',
  blue:  '#0D1B3D',
  green: '#00B67A',
  teal:  '#00E6D2',
  gold:  '#F5A623',
  bg:    '#F0F2F8',
} as const;

export const FONTS = {
  display: 'Sora',
  body:    'DM Sans',
} as const;
