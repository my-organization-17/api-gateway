import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class EmailRequestDto {
  @ApiProperty({
    description: 'User Email',
    type: String,
    example: 'user@example.com',
  })
  @IsEmail()
  readonly email: string;
}
