import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, Length, Matches } from 'class-validator';

export class SignUpRequestDto {
  @ApiProperty({
    description: 'User Email',
    type: String,
    example: 'user@example.com',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'User Password',
    type: String,
    example: 'Password123',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @Length(8, 100, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter and one number',
  })
  readonly password: string;

  @ApiPropertyOptional({
    description: 'User name',
    type: String,
    example: 'kotykhin_d',
    minLength: 2,
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @Length(2, 30, { message: 'Name must be at least 2 characters' })
  readonly name?: string | null;

  @ApiPropertyOptional({
    description: 'User phone number',
    type: String,
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber(undefined, { message: 'Phone number must be valid' })
  readonly phoneNumber?: string | null;
}
