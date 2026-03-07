import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class DeliveryAddressRequestDto {
  @ApiPropertyOptional({
    description: 'Unique identifier of the delivery address (for updates)',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  readonly addressId?: string;

  @ApiProperty({ description: 'Delivery address', type: String })
  @IsString()
  @IsNotEmpty()
  readonly addressLine: string;

  @ApiProperty({ description: 'City of the delivery address', type: String })
  @IsString()
  @IsNotEmpty()
  readonly city: string;

  @ApiPropertyOptional({ description: 'State of the delivery address', type: String })
  @IsOptional()
  @IsString()
  readonly state?: string;

  @ApiProperty({ description: 'Postal code of the delivery address', type: String })
  @IsString()
  @IsNotEmpty()
  readonly postalCode: string;

  @ApiProperty({ description: 'Country of the delivery address', type: String })
  @IsString()
  @IsNotEmpty()
  readonly country: string;

  @ApiPropertyOptional({
    description: 'Indicates whether this address is the default one for the user',
    type: Boolean,
    default: false,
  })
  @IsOptional()
  readonly isDefault?: boolean;
}
