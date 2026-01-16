import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from 'src/common/dto/user.response.dto';

export class AuthResponseDto {
  @Expose()
  @ApiProperty()
  readonly accessToken: string;

  @Expose()
  @ApiProperty()
  readonly refreshToken?: string;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: () => UserResponseDto })
  readonly user: UserResponseDto | null;
}
