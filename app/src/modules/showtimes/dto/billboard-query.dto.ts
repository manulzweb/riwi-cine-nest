// src/modules/showtimes/dto/billboard-query.dto.ts

import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsPositive } from 'class-validator';

export class BillboardQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cinemaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  cityId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  movieId?: number;

  @IsOptional()
  @IsDateString()
  date?: string; // YYYY-MM-DD
}
