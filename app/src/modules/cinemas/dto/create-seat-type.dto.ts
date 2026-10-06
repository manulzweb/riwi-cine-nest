// src/modules/cinemas/dto/create-seat-type.dto.ts

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSeatTypeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  priceFactor: number;
}
