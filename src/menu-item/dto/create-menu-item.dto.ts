import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly slug: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly price: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly imageUrl: string;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  readonly isAvailable: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  readonly categoryId: string;
}
