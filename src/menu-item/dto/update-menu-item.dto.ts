import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Language } from 'src/common/enums/language.enum';

export class UpdateMenuItemDto {
  @ApiProperty()
  @IsUUID()
  readonly id: string;

  @ApiProperty({
    enum: Language,
    enumName: 'Language',
    required: false,
  })
  @IsOptional()
  @IsEnum(Language)
  readonly language: Language;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly price: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly imageUrl: string;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  readonly isAvailable: boolean;
}
