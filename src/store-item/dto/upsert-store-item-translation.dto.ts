import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Language } from 'src/common/enums/language.enum';

export class UpsertStoreItemTranslationDto {
  @ApiProperty()
  @IsUUID()
  readonly itemId: string;

  @ApiProperty({ enum: Language, enumName: 'Language' })
  @IsEnum(Language)
  readonly language: Language;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly detailedDescription?: string;
}
