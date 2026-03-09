import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreCategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  readonly sortOrder: number;

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  readonly isAvailable: boolean;
}
