import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { SendOtpDto, VerifyOtpDto } from './otp/otp.dto';
import { ForgotPasswordDto, ResetPasswordDto, ResendVerificationDto } from './auth-extended.dto';

@Injectable()
export class AuthExtendedService {
  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
  ) {}

  // ── Send OTP to phone ──────────────────────────────────────────────────────
  async sendOtp(dto: SendOtpDto) {
    const { error } = await this.supabase.db.auth.signInWithOtp({
      phone: dto.phone,
    });
    if (error) throw new BadRequestException(error.message);
    return { message: `OTP sent to ${dto.phone}` };
  }

  // ── Verify OTP from phone ──────────────────────────────────────────────────
  async verifyOtp(dto: VerifyOtpDto) {
    const { data, error } = await this.supabase.db.auth.verifyOtp({
      phone: dto.phone,
      token: dto.token,
      type: 'sms',
    });
    if (error) throw new BadRequestException('Invalid or expired OTP.');
    return {
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user: data.user,
    };
  }

  // ── Forgot password — send reset email ────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const redirectTo = `${this.config.get('FRONTEND_URL') ?? 'http://localhost:3000'}/auth/reset-password`;
    const { error } = await this.supabase.db.auth.resetPasswordForEmail(dto.email, {
      redirectTo,
    });
    // Always return success to prevent email enumeration attacks
    if (error) console.error('Password reset error (suppressed):', error.message);
    return {
      message: 'If an account with that email exists, a reset link has been sent.',
    };
  }

  // ── Reset password (called after clicking email link) ─────────────────────
  async resetPassword(dto: ResetPasswordDto, accessToken: string) {
    // The user arrives with a valid session from the email link
    const { error } = await this.supabase.db.auth.updateUser({
      password: dto.password,
    });
    if (error) throw new BadRequestException(error.message);
    return { message: 'Password updated successfully. Please log in.' };
  }

  // ── Resend email verification ──────────────────────────────────────────────
  async resendVerification(dto: ResendVerificationDto) {
    const { error } = await this.supabase.db.auth.resend({
      type: 'signup',
      email: dto.email,
    });
    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Verification email resent.' };
  }
}
