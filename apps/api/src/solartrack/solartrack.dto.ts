import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDeviceDto {
  @ApiProperty({ example: 'ST-2025-GH-001' })
  @IsString() serial_number!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() panel_count?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() panel_capacity_w?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() battery_capacity_wh?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() location_label?: string;
}

export class IngestTelemetryDto {
  @ApiProperty({ example: 'ST-2025-GH-001' })
  @IsString() serial_number!: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() solar_watts?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() solar_voltage?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() solar_current?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() battery_pct?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() battery_voltage?: number;
  @ApiPropertyOptional() @IsOptional() @IsIn(['charging','discharging','full','idle']) battery_status?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() grid_watts?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() load_watts?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() temperature_c?: number;
}
