import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class PositionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  readonly position: number;
}
