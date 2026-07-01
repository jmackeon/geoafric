import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'kwame@example.com' })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'New password (min 8 chars)' })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class ResendVerificationDto {
  @ApiProperty({ example: 'kwame@example.com' })
  @IsEmail()
  email!: string;
}