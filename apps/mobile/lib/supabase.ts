import { createClient } from '@supabase/supabase-js';
import { tokenStorage } from './storage';

// IMPORTANT: Do NOT cache a singleton here — same rule as the web client
// (apps/web/src/lib/supabase.ts). Build a fresh client per call so it always
// carries the current access token.
//
// Auth/profile/location/etc. all go through the NestJS API (lib/api.ts).
// This client exists only for the handful of features that have no NestJS
// endpoint and query Supabase tables directly on web too (e.g. the
// notification_preferences table on the Settings page) — mirror that here
// rather than inventing a new backend endpoint.
export async function getSupabaseClient() {
  const client = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );

  const access_token = await tokenStorage.getToken();
  const refresh_token = await tokenStorage.getRefreshToken();
  if (access_token && refresh_token) {
    await client.auth.setSession({ access_token, refresh_token });
  }

  return client;
}
