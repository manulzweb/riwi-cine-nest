// src/modules/cinemas/dto/generate-seats.dto.ts

import { IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class GenerateSeatsDto {
  @IsInt()
  @Min(1)
  @Max(26)
  rows: number; // 1 to 26 (A-Z)

  @IsInt()
  @Min(1)
  @Max(50)
  seatsPerRow: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  seatTypeId?: number;
}
