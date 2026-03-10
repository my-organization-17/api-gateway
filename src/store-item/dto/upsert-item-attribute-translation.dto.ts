import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Language } from 'src/common/enums/language.enum';

export class UpsertItemAttributeTranslationDto {
  @ApiProperty()
  @IsUUID()
  readonly itemAttributeId: string;

  @ApiProperty({ enum: Language, enumName: 'Language' })
  @IsEnum(Language)
  readonly language: Language;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly value: string;
}
