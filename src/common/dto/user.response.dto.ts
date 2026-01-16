import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { UserRole } from 'src/generated-types/user';

export class UserResponseDto {
  @Expose()
  readonly id: string;

  @Expose()
  readonly email: string;

  @Expose()
  @Transform(({ value }) => UserRole[value as keyof typeof UserRole])
  readonly role: UserRole;

  @Expose()
  readonly isEmailVerified: boolean;

  @Expose()
  readonly isBanned: boolean;

  @ApiPropertyOptional()
  @Expose()
  readonly name?: string | null;

  @ApiPropertyOptional()
  @Expose()
  readonly phoneNumber?: string | null;

  @ApiPropertyOptional()
  @Expose()
  readonly avatarUrl?: string | null;
}
