import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsString, IsUUID } from 'class-validator';

export class BanUserRequestDto {
  @ApiProperty()
  @IsUUID()
  readonly id: string;

  @ApiPropertyOptional({ description: 'Reason for banning the user', type: String, nullable: true })
  @Optional()
  @IsString()
  readonly reason?: string | null;

  @ApiPropertyOptional({
    description: 'Date until which the user is banned',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @Optional()
  @IsDate()
  readonly banUntil?: Date | null;
}
