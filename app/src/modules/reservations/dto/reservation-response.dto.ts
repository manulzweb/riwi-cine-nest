export class ReservationSeatResponseDto {
  id: number;
  reservationId: number;
  seatId: number;
  status: string;
  price: number;
  seatNumber?: string;
  row?: string;
  number?: number;
}

export class ReservationResponseDto {
  id: number;
  userId: number;
  functionId: number;
  status: string;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  seats?: ReservationSeatResponseDto[];
  movieTitle?: string;
}
