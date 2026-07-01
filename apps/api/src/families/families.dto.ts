import { IsString, IsOptional, IsEmail, IsUUID, MinLength, MaxLength, IsNumber, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFamilyDto {
  @ApiProperty({ example: 'The Mensah Family' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;
}

export class UpdateFamilyDto {
  @ApiPropertyOptional({ example: 'Mensah Family Group' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name?: string;
}

export class InviteMemberDto {
  @ApiPropertyOptional({ example: 'ama@example.com', description: 'Optional — pre-fills invite for a specific email' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class JoinFamilyDto {
  @ApiProperty({ example: 'FMLY-A3X9', description: 'Invite code from the family owner' })
  @IsString()
  @MinLength(4)
  invite_code!: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['admin', 'member'] })
  @IsString()
  role!: 'admin' | 'member';
}

export class CreateGeofenceDto {
  @ApiProperty({ example: 'Home' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 5.6037 })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: -0.1870 })
  @IsNumber()
  lng!: number;

  @ApiPropertyOptional({ example: 200, description: 'Radius in metres' })
  @IsOptional()
  @IsNumber()
  @Min(50)
  radius_m?: number;

  @ApiPropertyOptional({ example: ['enter', 'exit'] })
  @IsOptional()
  @IsArray()
  alert_on?: string[];
}

export class UpdateGeofenceDto {
  @ApiPropertyOptional() @IsOptional() @IsString()  name?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber()  lat?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber()  lng?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(50) radius_m?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray()   alert_on?: string[];
}