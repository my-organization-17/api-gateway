import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuCategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly imageUrl: string;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  readonly isAvailable: boolean;
}
