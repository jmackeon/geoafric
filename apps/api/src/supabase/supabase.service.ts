import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor(private config: ConfigService) {
    // Standard client — respects Row Level Security (use for user-scoped queries)
    this.client = createClient(
      this.config.getOrThrow('SUPABASE_URL'),
      this.config.getOrThrow('SUPABASE_ANON_KEY'),
    );

    // Admin client — bypasses RLS (use only for server-side trusted operations)
    this.adminClient = createClient(
      this.config.getOrThrow('SUPABASE_URL'),
      this.config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  /** Use for user-scoped queries (respects RLS) */
  get db(): SupabaseClient {
    return this.client;
  }

  /** Use for admin/server operations (bypasses RLS) — use carefully */
  get admin(): SupabaseClient {
    return this.adminClient;
  }
}
