import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  isEmailVerified: boolean;

  @Expose()
  isBanned: boolean;

  @ApiPropertyOptional()
  @Expose()
  name?: string | null;

  @ApiPropertyOptional()
  @Expose()
  phoneNumber?: string | null;

  @ApiPropertyOptional()
  @Expose()
  avatarUrl?: string | null;
}
