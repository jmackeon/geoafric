import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private supabase: SupabaseService) {}

  async getProfile(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) throw new NotFoundException('Profile not found.');
    return data;
  }

  async updateProfile(userId: string, updates: Partial<{
    full_name: string;
    phone: string | null;
    language: string;
    avatar_url: string;
    onboarded: boolean;
  }>) {
    const { data, error } = await this.supabase.admin
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updatePushToken(userId: string, token: string) {
    const { data, error } = await this.supabase.admin
      .from('profiles')
      .update({ push_token: token, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}