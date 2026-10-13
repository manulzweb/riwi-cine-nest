// src/modules/reservations/dto/reservation-response.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReservationSeatResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  reservationId: number;

  @ApiProperty()
  seatId: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  seatNumber?: string;

  @ApiPropertyOptional()
  row?: string;

  @ApiPropertyOptional()
  number?: number;

  @ApiPropertyOptional()
  seatType?: string;
}

export class ReservationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  functionId: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  expiresAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: [ReservationSeatResponseDto] })
  seats?: ReservationSeatResponseDto[];

  @ApiPropertyOptional()
  totalAmount?: number;

  @ApiPropertyOptional()
  movieTitle?: string;

  @ApiPropertyOptional()
  moviePoster?: string;

  @ApiPropertyOptional()
  cinemaName?: string;

  @ApiPropertyOptional()
  roomName?: string;

  @ApiPropertyOptional()
  startTime?: Date | null;

  @ApiPropertyOptional()
  format?: string | null;
}
