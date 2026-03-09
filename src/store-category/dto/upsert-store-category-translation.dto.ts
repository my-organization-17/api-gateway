import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Language } from 'src/common/enums/language.enum';

export class UpsertStoreCategoryTranslationDto {
  @ApiProperty()
  @IsUUID()
  readonly categoryId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty({
    enum: Language,
    enumName: 'Language',
  })
  @IsEnum(Language)
  readonly language: Language;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly description: string;
}
