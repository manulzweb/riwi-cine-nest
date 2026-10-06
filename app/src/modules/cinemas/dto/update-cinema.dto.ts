// src/modules/cinemas/dto/update-cinema.dto.ts

import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCinemaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  cityId?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
