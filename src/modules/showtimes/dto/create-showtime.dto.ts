// src/modules/showtimes/dto/create-showtime.dto.ts

import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateShowtimeDto {
  @IsInt()
  @IsPositive()
  movieId: number;

  @IsInt()
  @IsPositive()
  roomId: number;

  @IsDateString()
  @IsNotEmpty()
  startTime: string; // ISO 8601

  @IsOptional()
  @IsDateString()
  endTime?: string; // ISO 8601

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  format?: string;
}
