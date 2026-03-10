import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddStoreItemImageDto {
  @ApiProperty()
  @IsUUID()
  readonly itemId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  readonly url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly alt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  readonly sortOrder?: number;
}
