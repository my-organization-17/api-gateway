import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddStoreItemVariantDto {
  @ApiProperty()
  @IsUUID()
  readonly itemId: string;

  @ApiProperty()
  @IsUUID()
  readonly attributeId: string;
}
