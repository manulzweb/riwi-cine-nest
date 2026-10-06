// src/modules/movies/dto/create-movie.dto.ts

import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  synopsis: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  director: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  formats?: string[];

  @IsInt()
  @Min(1)
  duration: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  classification: string;

  @IsDateString()
  releaseDate: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  posterUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  trailerUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  genre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  language?: string;

  @IsOptional()
  @IsBoolean()
  isSubtitled?: boolean;

  @IsOptional()
  @IsNumber()
  rating?: number;
}
