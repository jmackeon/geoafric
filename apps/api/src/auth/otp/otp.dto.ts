import { IsString, IsPhoneNumber, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+233241234567' })
  @IsPhoneNumber()
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+233241234567' })
  @IsPhoneNumber()
  phone!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  token!: string;
}