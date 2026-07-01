import { IsInt, IsNumber, IsOptional, IsString, IsIn, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogHeartRateDto {
  @ApiProperty({ example: 72, description: 'Heart rate in BPM' })
  @IsInt() @Min(20) @Max(300)
  bpm!: number;

  @ApiPropertyOptional({ enum: ['camera', 'manual', 'device'], default: 'manual' })
  @IsOptional() @IsString()
  method?: 'camera' | 'manual' | 'device';

  @ApiPropertyOptional({ example: 0.87, description: 'Camera confidence score 0–1' })
  @IsOptional() @IsNumber()
  confidence?: number;
}

export class LogActivityDto {
  @ApiPropertyOptional({ example: '2026-04-26' })
  @IsOptional() @IsDateString()
  date?: string;

  @ApiProperty({ example: 5432 })
  @IsInt() @Min(0)
  steps!: number;

  @ApiPropertyOptional({ example: 210.5 })
  @IsOptional() @IsNumber()
  calories?: number;

  @ApiPropertyOptional({ example: 3840 })
  @IsOptional() @IsNumber()
  distance_m?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional() @IsInt()
  active_mins?: number;
}

export class UpdateHealthGoalsDto {
  @ApiPropertyOptional({ example: 10000 })
  @IsOptional() @IsInt() @Min(1000)
  daily_steps?: number;

  @ApiPropertyOptional({ example: 55 })
  @IsOptional() @IsInt()
  target_bpm_min?: number;

  @ApiPropertyOptional({ example: 95 })
  @IsOptional() @IsInt()
  target_bpm_max?: number;

  @ApiPropertyOptional({ example: 2500 })
  @IsOptional() @IsInt()
  daily_water_ml?: number;
}
