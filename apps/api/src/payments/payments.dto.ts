import { IsString, IsIn, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitializePaymentDto {
  @ApiProperty({ enum: ['personal', 'family', 'enterprise'] })
  @IsString() @IsIn(['personal', 'family', 'enterprise'])
  plan_id!: string;

  @ApiProperty({ enum: ['monthly', 'annual'] })
  @IsString() @IsIn(['monthly', 'annual'])
  billing_cycle!: string;

  @ApiProperty({ enum: ['paystack', 'flutterwave', 'payaza'] })
  @IsString() @IsIn(['paystack', 'flutterwave', 'payaza'])
  provider!: string;

  @ApiPropertyOptional({ example: 'GHS', description: 'Currency code' })
  @IsOptional() @IsString()
  currency?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Transaction reference from provider' })
  @IsString()
  reference!: string;

  @ApiProperty({ enum: ['paystack', 'flutterwave', 'payaza'] })
  @IsString() @IsIn(['paystack', 'flutterwave', 'payaza'])
  provider!: string;
}
