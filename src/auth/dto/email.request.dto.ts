import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailRequestDto {
  @ApiProperty({
    description: 'User Email',
    type: String,
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
