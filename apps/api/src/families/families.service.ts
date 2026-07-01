import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateFamilyDto, UpdateFamilyDto, InviteMemberDto,
  JoinFamilyDto, UpdateMemberRoleDto,
  CreateGeofenceDto, UpdateGeofenceDto,
} from './families.dto';

// Generate a short invite code like "FMLY-A3X9"
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `FMLY-${part()}`;
}

@Injectable()
export class FamiliesService {
  constructor(private supabase: SupabaseService) {}

  // ── Create a family ────────────────────────────────────────────────────────
  async createFamily(userId: string, dto: CreateFamilyDto) {
    // Check user doesn't already own a family
    const { data: existing } = await this.supabase.admin
      .from('families')
      .select('id')
      .eq('owner_id', userId)
      .single();

    if (existing) {
      throw new ConflictException('You already own a family group. Upgrade your plan to create multiple families.');
    }

    const { data: family, error } = await this.supabase.admin
      .from('families')
      .insert({ name: dto.name, owner_id: userId })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Auto-add creator as owner member
    await this.supabase.admin.from('family_members').insert({
      family_id: family.id,
      user_id: userId,
      role: 'owner',
    });

    return family;
  }

  // ── Get all families the user belongs to ───────────────────────────────────
  async getMyFamilies(userId: string) {
    const { data, error } = await this.supabase.admin
      .from('family_members')
      .select(`
        role,
        joined_at,
        families (
          id, name, invite_code, owner_id, created_at,
          family_members ( count )
        )
      `)
      .eq('user_id', userId);

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ── Get a single family with full member list ──────────────────────────────
  async getFamily(familyId: string, userId: string) {
    await this.assertMember(familyId, userId);

    const { data, error } = await this.supabase.admin
      .from('families')
      .select(`
        id, name, invite_code, owner_id, created_at,
        family_members (
          id, role, nickname, joined_at,
          profiles ( id, full_name, avatar_url, phone )
        )
      `)
      .eq('id', familyId)
      .single();

    if (error || !data) throw new NotFoundException('Family not found.');
    return data;
  }

  // ── Update family name ─────────────────────────────────────────────────────
  async updateFamily(familyId: string, userId: string, dto: UpdateFamilyDto) {
    await this.assertRole(familyId, userId, ['owner', 'admin']);

    const { data, error } = await this.supabase.admin
      .from('families')
      .update({ name: dto.name, updated_at: new Date().toISOString() })
      .eq('id', familyId)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ── Delete a family ────────────────────────────────────────────────────────
  async deleteFamily(familyId: string, userId: string) {
    await this.assertRole(familyId, userId, ['owner']);

    const { error } = await this.supabase.admin
      .from('families')
      .delete()
      .eq('id', familyId);

    if (error) throw new BadRequestException(error.message);
    return { message: 'Family deleted.' };
  }

  // ── Create invite code ─────────────────────────────────────────────────────
  async createInvite(familyId: string, userId: string, dto: InviteMemberDto) {
    await this.assertRole(familyId, userId, ['owner', 'admin']);

    // Generate a unique code (retry up to 5 times)
    let code = '';
    for (let i = 0; i < 5; i++) {
      code = generateInviteCode();
      const { data } = await this.supabase.admin
        .from('family_invitations')
        .select('id')
        .eq('invite_code', code)
        .single();
      if (!data) break; // code is unique
    }

    const { data, error } = await this.supabase.admin
      .from('family_invitations')
      .insert({
        family_id:   familyId,
        invited_by:  userId,
        invite_code: code,
        email:       dto.email ?? null,
        expires_at:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    return {
      invite_code: data.invite_code,
      expires_at:  data.expires_at,
      share_link:  `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/join?code=${data.invite_code}`,
    };
  }

  // ── Get all invites for a family ───────────────────────────────────────────
  async getInvites(familyId: string, userId: string) {
    await this.assertRole(familyId, userId, ['owner', 'admin']);

    const { data, error } = await this.supabase.admin
      .from('family_invitations')
      .select('*, profiles!invited_by(full_name)')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ── Revoke an invite ───────────────────────────────────────────────────────
  async revokeInvite(inviteId: string, userId: string) {
    const { data: invite } = await this.supabase.admin
      .from('family_invitations')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (!invite) throw new NotFoundException('Invite not found.');
    await this.assertRole(invite.family_id, userId, ['owner', 'admin']);

    await this.supabase.admin
      .from('family_invitations')
      .update({ status: 'revoked' })
      .eq('id', inviteId);

    return { message: 'Invite revoked.' };
  }

  // ── Preview invite (unauthenticated) ──────────────────────────────────────
  async previewInvite(code: string) {
    const { data, error } = await this.supabase.admin
      .from('family_invitations')
      .select('*, families(name, family_members(count))')
      .eq('invite_code', code.toUpperCase())
      .single();

    if (error || !data) throw new NotFoundException('Invalid invite code.');
    if (data.status !== 'pending') throw new BadRequestException(`This invite has been ${data.status}.`);
    if (new Date(data.expires_at) < new Date()) throw new BadRequestException('This invite has expired.');

    return {
      family_name:    data.families?.name,
      member_count:   data.families?.family_members?.[0]?.count ?? 0,
      expires_at:     data.expires_at,
      invite_code:    data.invite_code,
    };
  }

  // ── Join a family via invite code ─────────────────────────────────────────
  async joinFamily(userId: string, dto: JoinFamilyDto) {
    const code = dto.invite_code.toUpperCase();

    const { data: invite, error } = await this.supabase.admin
      .from('family_invitations')
      .select('*')
      .eq('invite_code', code)
      .single();

    if (error || !invite) throw new NotFoundException('Invalid invite code.');
    if (invite.status !== 'pending') throw new BadRequestException(`This invite has been ${invite.status}.`);
    if (new Date(invite.expires_at) < new Date()) throw new BadRequestException('This invite has expired.');

    // Check not already a member
    const { data: existing } = await this.supabase.admin
      .from('family_members')
      .select('id')
      .eq('family_id', invite.family_id)
      .eq('user_id', userId)
      .single();

    if (existing) throw new ConflictException('You are already a member of this family.');

    // Add member
    await this.supabase.admin.from('family_members').insert({
      family_id: invite.family_id,
      user_id:   userId,
      role:      'member',
    });

    // Mark invite as accepted
    await this.supabase.admin
      .from('family_invitations')
      .update({ status: 'accepted', accepted_by: userId, accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    return { message: 'Welcome to the family!', family_id: invite.family_id };
  }

  // ── Remove a member ───────────────────────────────────────────────────────
  async removeMember(familyId: string, memberId: string, requesterId: string) {
    await this.assertRole(familyId, requesterId, ['owner', 'admin']);

    // Prevent removing the owner
    const { data: member } = await this.supabase.admin
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', memberId)
      .single();

    if (member?.role === 'owner') throw new ForbiddenException('Cannot remove the family owner.');

    await this.supabase.admin
      .from('family_members')
      .delete()
      .eq('family_id', familyId)
      .eq('user_id', memberId);

    return { message: 'Member removed.' };
  }

  // ── Update member role ─────────────────────────────────────────────────────
  async updateMemberRole(familyId: string, memberId: string, requesterId: string, dto: UpdateMemberRoleDto) {
    await this.assertRole(familyId, requesterId, ['owner']);

    await this.supabase.admin
      .from('family_members')
      .update({ role: dto.role })
      .eq('family_id', familyId)
      .eq('user_id', memberId);

    return { message: `Member role updated to ${dto.role}.` };
  }

  // ── Leave a family ────────────────────────────────────────────────────────
  async leaveFamily(familyId: string, userId: string) {
    const { data: member } = await this.supabase.admin
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', userId)
      .single();

    if (!member) throw new NotFoundException('You are not a member of this family.');
    if (member.role === 'owner') throw new ForbiddenException('Transfer ownership before leaving.');

    await this.supabase.admin
      .from('family_members')
      .delete()
      .eq('family_id', familyId)
      .eq('user_id', userId);

    return { message: 'You have left the family.' };
  }

  // ── Geofence: create ───────────────────────────────────────────────────────
  async createGeofence(familyId: string, userId: string, dto: CreateGeofenceDto) {
    await this.assertRole(familyId, userId, ['owner', 'admin']);

    const { data, error } = await this.supabase.admin
      .from('geofence_zones')
      .insert({
        family_id:  familyId,
        name:       dto.name,
        lat:        dto.lat,
        lng:        dto.lng,
        radius_m:   dto.radius_m ?? 200,
        alert_on:   dto.alert_on ?? ['enter', 'exit'],
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ── Geofence: list ─────────────────────────────────────────────────────────
  async getGeofences(familyId: string, userId: string) {
    await this.assertMember(familyId, userId);

    const { data, error } = await this.supabase.admin
      .from('geofence_zones')
      .select('*, profiles!created_by(full_name)')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ── Geofence: update ───────────────────────────────────────────────────────
  async updateGeofence(zoneId: string, userId: string, dto: UpdateGeofenceDto) {
    const { data: zone } = await this.supabase.admin
      .from('geofence_zones')
      .select('family_id')
      .eq('id', zoneId)
      .single();

    if (!zone) throw new NotFoundException('Geofence zone not found.');
    await this.assertRole(zone.family_id, userId, ['owner', 'admin']);

    const { data, error } = await this.supabase.admin
      .from('geofence_zones')
      .update(dto)
      .eq('id', zoneId)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ── Geofence: delete ───────────────────────────────────────────────────────
  async deleteGeofence(zoneId: string, userId: string) {
    const { data: zone } = await this.supabase.admin
      .from('geofence_zones')
      .select('family_id')
      .eq('id', zoneId)
      .single();

    if (!zone) throw new NotFoundException('Geofence zone not found.');
    await this.assertRole(zone.family_id, userId, ['owner', 'admin']);

    await this.supabase.admin.from('geofence_zones').delete().eq('id', zoneId);
    return { message: 'Geofence zone deleted.' };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private async assertMember(familyId: string, userId: string) {
    const { data } = await this.supabase.admin
      .from('family_members')
      .select('id')
      .eq('family_id', familyId)
      .eq('user_id', userId)
      .single();
    if (!data) throw new ForbiddenException('You are not a member of this family.');
  }

  private async assertRole(familyId: string, userId: string, roles: string[]) {
    const { data } = await this.supabase.admin
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', userId)
      .single();
    if (!data || !roles.includes(data.role)) {
      throw new ForbiddenException('You do not have permission to perform this action.');
    }
  }
}
