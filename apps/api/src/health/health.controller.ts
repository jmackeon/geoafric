import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Request, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { LogHeartRateDto, LogActivityDto, UpdateHealthGoalsDto } from './health.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

type AuthReq = ExpressRequest & { user: { id: string } };

@ApiTags('Health')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('health')
export class HealthController {
  constructor(private health: HealthService) {}

  // ── Heart Rate ─────────────────────────────────────────────────────────────
  @Post('heart-rate')
  @ApiOperation({ summary: 'Log a heart rate reading' })
  logHeartRate(@Request() req: AuthReq, @Body() dto: LogHeartRateDto) {
    return this.health.logHeartRate(req.user.id, dto);
  }

  @Get('heart-rate')
  @ApiOperation({ summary: 'Get heart rate history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getHeartRate(@Request() req: AuthReq, @Query('limit') limit?: number) {
    return this.health.getHeartRateHistory(req.user.id, limit ? +limit : 50);
  }

  @Get('heart-rate/stats')
  @ApiOperation({ summary: 'Get heart rate stats for last 7 days' })
  getHeartRateStats(@Request() req: AuthReq) {
    return this.health.getHeartRateStats(req.user.id);
  }

  // ── Activity ───────────────────────────────────────────────────────────────
  @Post('activity')
  @ApiOperation({ summary: 'Log or update daily activity' })
  logActivity(@Request() req: AuthReq, @Body() dto: LogActivityDto) {
    return this.health.logActivity(req.user.id, dto);
  }

  @Get('activity/today')
  @ApiOperation({ summary: "Get today's activity" })
  getTodayActivity(@Request() req: AuthReq) {
    return this.health.getTodayActivity(req.user.id);
  }

  @Get('activity/history')
  @ApiOperation({ summary: 'Get activity history' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getActivityHistory(@Request() req: AuthReq, @Query('days') days?: number) {
    return this.health.getActivityHistory(req.user.id, days ? +days : 7);
  }

  // ── Goals ──────────────────────────────────────────────────────────────────
  @Get('goals')
  @ApiOperation({ summary: 'Get health goals' })
  getGoals(@Request() req: AuthReq) {
    return this.health.getGoals(req.user.id);
  }

  @Patch('goals')
  @ApiOperation({ summary: 'Update health goals' })
  updateGoals(@Request() req: AuthReq, @Body() dto: UpdateHealthGoalsDto) {
    return this.health.updateGoals(req.user.id, dto);
  }

  // ── AI Insights ────────────────────────────────────────────────────────────
  @Get('insights')
  @ApiOperation({ summary: 'Get AI health insights' })
  getInsights(@Request() req: AuthReq) {
    return this.health.getInsights(req.user.id);
  }

  @Post('insights/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a new AI health insight' })
  generateInsight(@Request() req: AuthReq) {
    return this.health.generateAiInsight(req.user.id);
  }

  @Patch('insights/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark an insight as read' })
  markRead(@Param('id') id: string, @Request() req: AuthReq) {
    return this.health.markInsightRead(id, req.user.id);
  }
}
