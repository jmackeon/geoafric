import { Controller, Post, Body, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthExtendedService } from './auth-extended.service';
import { SendOtpDto, VerifyOtpDto } from './otp/otp.dto';
import { ForgotPasswordDto, ResetPasswordDto, ResendVerificationDto } from './auth-extended.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Auth — Extended')
@Controller('auth')
export class AuthExtendedController {
  constructor(private authExtended: AuthExtendedService) {}

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone number (SMS)' })
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authExtended.sendOtp(dto);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify phone OTP and return session' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authExtended.verifyOtp(dto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset email' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authExtended.forgotPassword(dto);
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email link' })
  resetPassword(@Body() dto: ResetPasswordDto, @Request() req: ExpressRequest) {
    const token = req.headers.authorization?.split(' ')[1] ?? '';
    return this.authExtended.resetPassword(dto, token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification link' })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authExtended.resendVerification(dto);
  }
}