import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreItemDto {
  @ApiProperty()
  @IsUUID()
  readonly categoryId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly brand?: string;

  @ApiPropertyOptional({ type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  readonly isAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readonly expectedDate?: string;
}
