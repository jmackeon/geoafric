import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// IMPORTANT: Singleton on purpose (browser only).
// createBrowserClient reads cookies live from document.cookie on every
// call it makes internally, so there's no correctness benefit to
// reconstructing the client. Reconstructing it, however, spins up a new
// GoTrueClient — new visibilitychange/storage listeners + a new
// auto-refresh timer — that is never torn down. Calling this from render
// bodies or per-request interceptors leaked dozens of these over a
// session, which is what caused buttons to stop responding and repeated
// "Multiple GoTrueClient instances detected" warnings.
let browserClient: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return browserClient;
}

// Keep createClient as an alias for compatibility
export const createClient = getSupabaseClient;