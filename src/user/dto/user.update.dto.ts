import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, MinLength } from 'class-validator';

export class UserUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Length(2, 30, { message: 'Name must be at least 2 characters' })
  readonly name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  readonly avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber(undefined, { message: 'Phone number must be valid' })
  readonly phoneNumber?: string;
}
