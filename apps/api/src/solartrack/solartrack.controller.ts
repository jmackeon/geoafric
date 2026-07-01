import { Controller, Get, Post, Patch, Body, Param, Query, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SolarTrackService } from './solartrack.service';
import { RegisterDeviceDto, IngestTelemetryDto } from './solartrack.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

type AuthReq = ExpressRequest & { user: { id: string } };

@ApiTags('SolarTrack')
@Controller('solartrack')
export class SolarTrackController {
  constructor(private solar: SolarTrackService) {}

  // Hardware ingest — no user auth, device uses serial number
  @Post('ingest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hardware telemetry ingestion endpoint (called by device)' })
  ingest(@Body() dto: IngestTelemetryDto) {
    return this.solar.ingestTelemetry(dto);
  }

  // All other routes require user auth
  @Get('summary')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  summary(@Request() req: AuthReq) { return this.solar.getSummary(req.user.id); }

  @Get('devices')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  getDevices(@Request() req: AuthReq) { return this.solar.getDevices(req.user.id); }

  @Post('devices')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  register(@Request() req: AuthReq, @Body() dto: RegisterDeviceDto) { return this.solar.registerDevice(req.user.id, dto); }

  @Get('telemetry')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  getLatest(@Request() req: AuthReq) { return this.solar.getLatestTelemetry(req.user.id); }

  @Get('telemetry/:deviceId/history')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  getHistory(@Request() req: AuthReq, @Param('deviceId') deviceId: string, @Query('hours') hours?: number) {
    return this.solar.getTelemetryHistory(req.user.id, deviceId, hours ? +hours : 24);
  }

  @Get('alerts')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  getAlerts(@Request() req: AuthReq, @Query('resolved') resolved?: string) {
    return this.solar.getAlerts(req.user.id, resolved === 'true');
  }

  @Patch('alerts/:id/resolve')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  resolve(@Request() req: AuthReq, @Param('id') id: string) { return this.solar.resolveAlert(req.user.id, id); }
}
