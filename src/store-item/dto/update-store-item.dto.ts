import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStoreItemDto {
  @ApiProperty()
  @IsUUID()
  readonly itemId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  readonly categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly brand?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  readonly isAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readonly expectedDate?: string;
}
