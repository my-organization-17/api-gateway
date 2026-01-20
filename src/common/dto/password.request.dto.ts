import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class PasswordRequestDto {
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
}
