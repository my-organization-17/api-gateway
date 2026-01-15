import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @Expose()
  @ApiProperty()
  accessToken: string;
}
