import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Request, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import {
  CreateFamilyDto, UpdateFamilyDto, InviteMemberDto,
  JoinFamilyDto, UpdateMemberRoleDto,
  CreateGeofenceDto, UpdateGeofenceDto,
} from './families.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

type AuthReq = ExpressRequest & { user: { id: string } };

@ApiTags('Families')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families')
export class FamiliesController {
  constructor(private families: FamiliesService) {}

  // ── Family CRUD ────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Create a new family group' })
  createFamily(@Request() req: AuthReq, @Body() dto: CreateFamilyDto) {
    return this.families.createFamily(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all families the user belongs to' })
  getMyFamilies(@Request() req: AuthReq) {
    return this.families.getMyFamilies(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a family with full member list' })
  getFamily(@Param('id') id: string, @Request() req: AuthReq) {
    return this.families.getFamily(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update family name (owner/admin only)' })
  updateFamily(@Param('id') id: string, @Request() req: AuthReq, @Body() dto: UpdateFamilyDto) {
    return this.families.updateFamily(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a family (owner only)' })
  deleteFamily(@Param('id') id: string, @Request() req: AuthReq) {
    return this.families.deleteFamily(id, req.user.id);
  }

  // ── Invites ────────────────────────────────────────────────────────────────
  @Post(':id/invites')
  @ApiOperation({ summary: 'Generate an invite code for the family' })
  createInvite(@Param('id') id: string, @Request() req: AuthReq, @Body() dto: InviteMemberDto) {
    return this.families.createInvite(id, req.user.id, dto);
  }

  @Get(':id/invites')
  @ApiOperation({ summary: 'List all invites for a family' })
  getInvites(@Param('id') id: string, @Request() req: AuthReq) {
    return this.families.getInvites(id, req.user.id);
  }

  @Delete('invites/:inviteId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an invite' })
  revokeInvite(@Param('inviteId') inviteId: string, @Request() req: AuthReq) {
    return this.families.revokeInvite(inviteId, req.user.id);
  }

  // ── Join ───────────────────────────────────────────────────────────────────
  @Post('join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join a family using an invite code' })
  joinFamily(@Request() req: AuthReq, @Body() dto: JoinFamilyDto) {
    return this.families.joinFamily(req.user.id, dto);
  }

  // ── Members ────────────────────────────────────────────────────────────────
  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a member from the family' })
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string, @Request() req: AuthReq) {
    return this.families.removeMember(id, memberId, req.user.id);
  }

  @Patch(':id/members/:memberId/role')
  @ApiOperation({ summary: 'Update a member role (owner only)' })
  updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req: AuthReq,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.families.updateMemberRole(id, memberId, req.user.id, dto);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave a family group' })
  leaveFamily(@Param('id') id: string, @Request() req: AuthReq) {
    return this.families.leaveFamily(id, req.user.id);
  }

  // ── Geofences ──────────────────────────────────────────────────────────────
  @Post(':id/geofences')
  @ApiOperation({ summary: 'Create a geofence zone for the family' })
  createGeofence(@Param('id') id: string, @Request() req: AuthReq, @Body() dto: CreateGeofenceDto) {
    return this.families.createGeofence(id, req.user.id, dto);
  }

  @Get(':id/geofences')
  @ApiOperation({ summary: 'List all geofence zones for a family' })
  getGeofences(@Param('id') id: string, @Request() req: AuthReq) {
    return this.families.getGeofences(id, req.user.id);
  }

  @Patch('geofences/:zoneId')
  @ApiOperation({ summary: 'Update a geofence zone' })
  updateGeofence(@Param('zoneId') zoneId: string, @Request() req: AuthReq, @Body() dto: UpdateGeofenceDto) {
    return this.families.updateGeofence(zoneId, req.user.id, dto);
  }

  @Delete('geofences/:zoneId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a geofence zone' })
  deleteGeofence(@Param('zoneId') zoneId: string, @Request() req: AuthReq) {
    return this.families.deleteGeofence(zoneId, req.user.id);
  }
}

// ── Public controller (no auth) — for invite preview ──────────────────────────
@ApiTags('Families')
@Controller('families')
export class FamiliesPublicController {
  constructor(private families: FamiliesService) {}

  @Get('invite/:code/preview')
  @ApiOperation({ summary: 'Preview a family invite (no auth required)' })
  previewInvite(@Param('code') code: string) {
    return this.families.previewInvite(code);
  }
}
