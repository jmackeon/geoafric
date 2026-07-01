import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

type AuthRequest = ExpressRequest & { user: { id: string } };

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: AuthRequest) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(
    @Request() req: AuthRequest,
    @Body() body: { full_name?: string; phone?: string | null; language?: string; avatar_url?: string; onboarded?: boolean },
  ) {
    return this.usersService.updateProfile(req.user.id, body);
  }
}