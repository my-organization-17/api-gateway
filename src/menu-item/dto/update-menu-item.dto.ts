import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuItemDto {
  @ApiProperty()
  @IsUUID()
  readonly id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
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
}
