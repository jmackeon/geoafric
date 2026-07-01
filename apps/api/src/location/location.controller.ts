import {
  Controller, Get, Post, Patch, Body,
  Query, Request, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { UpdateLocationDto, UpdateLocationSettingsDto } from './location.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

type AuthReq = ExpressRequest & { user: { id: string } };

@ApiTags('Location')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('location')
export class LocationController {
  constructor(private location: LocationService) {}

  // ── My location ────────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update my current location' })
  updateLocation(@Request() req: AuthReq, @Body() dto: UpdateLocationDto) {
    return this.location.updateLocation(req.user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my latest location' })
  getMyLocation(@Request() req: AuthReq) {
    return this.location.getMyLocation(req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get my location history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getHistory(@Request() req: AuthReq, @Query('limit') limit?: number) {
    return this.location.getLocationHistory(req.user.id, limit ? +limit : 50);
  }

  // ── Family locations ───────────────────────────────────────────────────────
  @Get('family')
  @ApiOperation({ summary: 'Get all visible family member locations' })
  getFamilyLocations(@Request() req: AuthReq) {
    return this.location.getFamilyLocations(req.user.id);
  }

  @Get('geofences')
  @ApiOperation({ summary: 'Get geofence zones for map display' })
  getGeofences(@Request() req: AuthReq) {
    return this.location.getFamilyGeofences(req.user.id);
  }

  // ── Settings ───────────────────────────────────────────────────────────────
  @Get('settings')
  @ApiOperation({ summary: 'Get location sharing settings' })
  getSettings(@Request() req: AuthReq) {
    return this.location.getSettings(req.user.id);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update location sharing settings' })
  updateSettings(@Request() req: AuthReq, @Body() dto: UpdateLocationSettingsDto) {
    return this.location.updateSettings(req.user.id, dto);
  }

  // ── SOS ────────────────────────────────────────────────────────────────────
  @Post('sos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger SOS alert with current location' })
  triggerSOS(
    @Request() req: AuthReq,
    @Body() body: { lat: number; lng: number },
  ) {
    return this.location.triggerSOS(req.user.id, body.lat, body.lng);
  }
}
