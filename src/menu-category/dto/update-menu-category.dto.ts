import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Language } from 'src/common/types/language.enum';

export class UpdateMenuCategoryDto {
  @ApiProperty({
    enum: Language,
    enumName: 'Language',
  })
  @IsEnum(Language)
  readonly language: Language;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly imageUrl: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  readonly isAvailable: boolean;
}
