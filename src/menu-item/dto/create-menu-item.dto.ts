import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Language } from 'src/common/enums/language.enum';

class MenuCategoryIdDto {
  @ApiProperty()
  @IsUUID()
  readonly id: string;
}

export class CreateMenuItemDto {
  @ApiProperty({
    enum: Language,
    enumName: 'Language',
  })
  @IsEnum(Language)
  readonly language: Language;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty()
  @IsNotEmpty()
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

  @ApiProperty({ type: MenuCategoryIdDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MenuCategoryIdDto)
  readonly menuCategory: MenuCategoryIdDto;
}
