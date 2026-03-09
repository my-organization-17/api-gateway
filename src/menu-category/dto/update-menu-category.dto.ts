import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly imageUrl: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  readonly isAvailable: boolean;
}
