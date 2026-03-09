import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStoreAttributeDto {
  @ApiProperty()
  @IsUUID()
  readonly id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly slug: string;
}
