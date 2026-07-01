import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchPlacesDto {
  @ApiPropertyOptional({ example: 5.6037 })
  @IsOptional() @Type(() => Number) @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: -0.1870 })
  @IsOptional() @Type(() => Number) @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ example: 'hospital' })
  @IsOptional() @IsString()
  query?: string;

  @ApiPropertyOptional({ example: 'food' })
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional() @Type(() => Number) @IsNumber()
  radius?: number;
}

export class SavePlaceDto {
  @IsString() google_place_id!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
  @IsOptional() @IsNumber() rating?: number;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() photo_url?: string;
  @IsOptional() @IsString() notes?: string;
}