import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateLocationDto, UpdateLocationSettingsDto } from './location.dto';

@Injectable()
export class LocationService {
  constructor(private supabase: SupabaseService) {}

  // ── Update my location ─────────────────────────────────────────────────────
  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const { data, error } = await this.supabase.admin
      .from('location_updates')
      .insert({
        user_id:    userId,
        lat:        dto.lat,
        lng:        dto.lng,
        accuracy:   dto.accuracy ?? null,
        altitude:   dto.altitude ?? null,
        speed:      dto.speed ?? null,
        heading:    dto.heading ?? null,
        source:     dto.source ?? 'browser',
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Prune old records — keep only the last 100 per user
    await this.supabase.admin.rpc('prune_location_history', {
      p_user_id: userId,
      p_keep: 100,
    }).maybeSingle();

    return data;
  }

  // ── Get my latest location ─────────────────────────────────────────────────
  async getMyLocation(userId: string) {
    const { data } = await this.supabase.admin
      .from('location_updates')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();
    return data ?? null;
  }

  // ── Get my location history ────────────────────────────────────────────────
  async getLocationHistory(userId: string, limit = 50) {
    const { data, error } = await this.supabase.admin
      .from('location_updates')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  // ── Get all visible family member locations ────────────────────────────────
  async getFamilyLocations(userId: string) {
    // Get all families the user belongs to
    const { data: memberships } = await this.supabase.admin
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId);

    if (!memberships?.length) return [];

    const familyIds = memberships.map(m => m.family_id);

    // Get all other members in those families
    const { data: members } = await this.supabase.admin
      .from('family_members')
      .select('user_id')
      .in('family_id', familyIds)
      .neq('user_id', userId);

    if (!members?.length) return [];

    const memberIds = [...new Set(members.map(m => m.user_id))];

    // Get latest location for each member (only if sharing enabled)
    const results = await Promise.all(
      memberIds.map(async (memberId) => {
        const { data: settings } = await this.supabase.admin
          .from('location_settings')
          .select('sharing_enabled, share_with_family')
          .eq('user_id', memberId)
          .single();

        if (!settings?.sharing_enabled || !settings?.share_with_family) return null;

        const { data: location } = await this.supabase.admin
          .from('location_updates')
          .select('*, profiles(full_name, avatar_url)')
          .eq('user_id', memberId)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .single();

        return location ?? null;
      })
    );

    return results.filter(Boolean);
  }

  // ── Get geofence zones for map display ────────────────────────────────────
  async getFamilyGeofences(userId: string) {
    const { data: memberships } = await this.supabase.admin
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId);

    if (!memberships?.length) return [];

    const familyIds = memberships.map(m => m.family_id);

    const { data } = await this.supabase.admin
      .from('geofence_zones')
      .select('*')
      .in('family_id', familyIds);

    return data ?? [];
  }

  // ── Location settings ──────────────────────────────────────────────────────
  async getSettings(userId: string) {
    const { data } = await this.supabase.admin
      .from('location_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data ?? {
      sharing_enabled: true, share_with_family: true,
      high_accuracy: true, update_interval: 30, battery_saver: false,
    };
  }

  async updateSettings(userId: string, dto: UpdateLocationSettingsDto) {
    const { data, error } = await this.supabase.admin
      .from('location_settings')
      .upsert({
        user_id: userId,
        ...dto,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ── SOS — broadcast emergency alert ───────────────────────────────────────
  async triggerSOS(userId: string, lat: number, lng: number) {
    // Save SOS location
    await this.updateLocation(userId, { lat, lng, source: 'browser' });

    // Create high-priority health insight for all family members
    const { data: memberships } = await this.supabase.admin
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId);

    if (memberships?.length) {
      const familyIds = memberships.map(m => m.family_id);
      const { data: members } = await this.supabase.admin
        .from('family_members')
        .select('user_id, profiles(full_name)')
        .in('family_id', familyIds)
        .neq('user_id', userId);

      const { data: sender } = await this.supabase.admin
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      // Insert SOS alert for each family member
      if (members?.length) {
        await this.supabase.admin.from('health_insights').insert(
          members.map((m: any) => ({
            user_id:  m.user_id,
            type:     'alert',
            severity: 'critical',
            title:    '🆘 SOS Alert',
            message:  `${sender?.full_name ?? 'A family member'} has triggered an SOS at (${lat.toFixed(4)}, ${lng.toFixed(4)}). Please check on them immediately.`,
          }))
        );
      }
    }

    return { message: 'SOS sent to all family members.', lat, lng };
  }
}
