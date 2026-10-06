// src/modules/showtimes/dto/update-showtime.dto.ts

import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateShowtimeDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  movieId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  roomId?: number;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  format?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
