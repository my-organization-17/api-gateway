import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMenuCategoryTranslationDto {
  @ApiProperty()
  @IsUUID()
  readonly id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly description: string;
}
