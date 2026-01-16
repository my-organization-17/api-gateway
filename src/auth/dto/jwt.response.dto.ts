import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/generated-types/user';

export class JwtResponseDto {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly isBanned: boolean;

  @ApiProperty()
  readonly role: UserRole;
}
