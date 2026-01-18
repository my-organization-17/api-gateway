import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class BanUserRequestDto {
  @ApiProperty()
  @IsUUID()
  readonly id: string;

  @ApiPropertyOptional({ description: 'Reason for banning the user', type: String, nullable: true })
  @IsOptional()
  @IsString()
  readonly reason?: string | null;

  @ApiPropertyOptional({
    description: 'Date until which the user is banned',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly banUntil?: Date | null;
}
