import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreAttributeDto {
  @ApiProperty()
  @IsUUID()
  readonly categoryId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly slug: string;
}
