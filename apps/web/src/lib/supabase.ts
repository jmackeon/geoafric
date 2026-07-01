import { createBrowserClient } from '@supabase/ssr';

// IMPORTANT: Do NOT use a singleton here.
// createBrowserClient must be called fresh so it can
// read and write cookies correctly on every call.
export function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Keep createClient as an alias for compatibility
export const createClient = getSupabaseClient;