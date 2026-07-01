import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Kwame Mensah' })
  @IsString()
  full_name!: string;

  @ApiProperty({ example: 'kwame@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: '+233241234567' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'kwame@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  password!: string;
}

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google OAuth ID token from client' })
  @IsString()
  id_token!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refresh_token!: string;
}