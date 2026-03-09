import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Language } from 'src/common/enums/language.enum';

export class UpsertStoreAttributeTranslationDto {
  @ApiProperty()
  @IsUUID()
  readonly attributeId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    enum: Language,
    enumName: 'Language',
  })
  @IsEnum(Language)
  readonly language: Language;
}
