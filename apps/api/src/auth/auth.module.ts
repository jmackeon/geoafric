import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthExtendedService } from './auth-extended.service';
import { AuthExtendedController } from './auth-extended.controller';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  providers: [AuthService, AuthExtendedService, JwtAuthGuard],
  controllers: [AuthController, AuthExtendedController],
  exports: [AuthService, AuthExtendedService, JwtAuthGuard],
})
export class AuthModule {}
