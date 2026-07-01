import { IsNumber, IsOptional, IsString, IsBoolean, IsIn, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({ example: 5.6037, description: 'Latitude' })
  @IsNumber() @Min(-90) @Max(90)
  lat!: number;

  @ApiProperty({ example: -0.1870, description: 'Longitude' })
  @IsNumber() @Min(-180) @Max(180)
  lng!: number;

  @ApiPropertyOptional({ example: 12.5, description: 'Accuracy in metres' })
  @IsOptional() @IsNumber()
  accuracy?: number;

  @ApiPropertyOptional({ example: 45.2, description: 'Altitude in metres' })
  @IsOptional() @IsNumber()
  altitude?: number;

  @ApiPropertyOptional({ example: 1.4, description: 'Speed in m/s' })
  @IsOptional() @IsNumber()
  speed?: number;

  @ApiPropertyOptional({ example: 180.0, description: 'Heading in degrees 0-360' })
  @IsOptional() @IsNumber()
  heading?: number;

  @ApiPropertyOptional({ enum: ['browser', 'mobile', 'solartrack', 'manual'], default: 'browser' })
  @IsOptional() @IsIn(['browser', 'mobile', 'solartrack', 'manual'])
  source?: string;
}

export class UpdateLocationSettingsDto {
  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  sharing_enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  share_with_family?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  high_accuracy?: boolean;

  @ApiPropertyOptional({ example: 30, description: 'Update interval in seconds' })
  @IsOptional() @IsNumber()
  update_interval?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  battery_saver?: boolean;
}
