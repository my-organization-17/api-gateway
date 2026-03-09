import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStoreCategoryDto {
  @ApiProperty()
  @IsUUID()
  readonly id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly slug: string;

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  readonly isAvailable: boolean;
}
