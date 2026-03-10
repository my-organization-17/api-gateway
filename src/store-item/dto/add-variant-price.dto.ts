import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Currency, PriceType } from 'src/common/enums';

export class AddVariantPriceDto {
  @ApiProperty()
  @IsUUID()
  readonly itemAttributeId: string;

  @ApiProperty({ enum: PriceType, enumName: 'PriceType' })
  @IsEnum(PriceType)
  readonly priceType: PriceType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly value: string;

  @ApiPropertyOptional({ enum: Currency, enumName: 'Currency' })
  @IsOptional()
  @IsEnum(Currency)
  readonly currency?: Currency;
}
