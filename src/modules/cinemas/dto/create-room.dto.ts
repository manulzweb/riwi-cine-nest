// src/modules/cinemas/dto/create-room.dto.ts

import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  format: string; // e.g. 2D, 3D, IMAX, VIP

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  cinemaId?: number;
}
