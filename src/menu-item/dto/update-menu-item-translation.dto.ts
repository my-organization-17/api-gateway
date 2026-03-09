import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMenuItemTranslationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  readonly id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly description: string;
}
