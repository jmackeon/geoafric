import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto, LoginDto, GoogleAuthDto, RefreshTokenDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  // ── Register with email & password ─────────────────────────────────────────
  async register(dto: RegisterDto) {
    // TODO: re-enable email confirmation (email_confirm: false) before production.
    const { data, error } = await this.supabase.admin.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: {
        full_name: dto.full_name,
        phone: dto.phone ?? null,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new ConflictException('An account with this email already exists.');
      }
      throw new InternalServerErrorException(error.message);
    }

    // Sign the new user straight in since no email confirmation is required for now.
    return this.login({ email: dto.email, password: dto.password });
  }

  // ── Login with email & password ────────────────────────────────────────────
  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.db.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: await this.formatUser(data.user),
    };
  }

  // ── Google SSO ─────────────────────────────────────────────────────────────
  async googleAuth(dto: GoogleAuthDto) {
    // Exchange Google ID token for a Supabase session
    const { data, error } = await this.supabase.db.auth.signInWithIdToken({
      provider: 'google',
      token: dto.id_token,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Google authentication failed.');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: await this.formatUser(data.user),
    };
  }

  // ── Refresh access token ───────────────────────────────────────────────────
  async refresh(dto: RefreshTokenDto) {
    const { data, error } = await this.supabase.db.auth.refreshSession({
      refresh_token: dto.refresh_token,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    };
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  async logout(accessToken: string) {
    // Sign out using the user's own token (respects RLS)
    const client = this.supabase.db;
    await client.auth.admin; // no-op, just triggers the sign-out
    const { error } = await this.supabase.admin.auth.admin.signOut(accessToken, 'global');

    if (error) {
      throw new InternalServerErrorException('Logout failed.');
    }

    return { message: 'Logged out successfully.' };
  }

  // ── Validate JWT token (used by guards) ────────────────────────────────────
  async validateToken(token: string) {
    const { data, error } = await this.supabase.admin.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  }

  // ── Format user for response ───────────────────────────────────────────────
  // Public — also used directly by AuthController#me, since the raw object
  // returned by validateToken() needs the same shaping (and the onboarded
  // flag merged in from profiles) as the login/register/googleAuth responses.
  async formatUser(user: any) {
    const { data: profile } = await this.supabase.admin
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name ?? null,
      phone: user.user_metadata?.phone ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      provider: user.app_metadata?.provider ?? 'email',
      created_at: user.created_at,
      onboarded: profile?.onboarded ?? false,
    };
  }
}