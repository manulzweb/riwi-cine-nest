// src/modules/reservations/dto/create-reservation.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ description: 'ID de la función de cine', example: 1 })
  @IsInt()
  functionId: number;

  @ApiProperty({
    description: 'Array de IDs de butacas a reservar',
    example: [1, 2],
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  seatIds: number[];
}
