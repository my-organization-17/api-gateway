import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from 'src/common/dto/user.response.dto';

export class AuthResponseDto {
  @Expose()
  @ApiProperty()
  accessToken: string;

  @Expose()
  @ApiProperty()
  refreshToken?: string;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto | null;
}
