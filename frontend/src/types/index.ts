// src/types/index.ts

export interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string | string[];
  details?: Record<string, any>;
  timestamp?: string;
  path?: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
  isActive: boolean;
  profile?: {
    id: number;
    firstName: string;
    lastName: string;
    phone?: string;
    acceptedTerms?: boolean;
    dataProcessingConsent?: boolean;
  };
}

export interface City {
  id: number;
  name: string;
  departmentId?: number;
}

export interface Cinema {
  id: number;
  name: string;
  address: string;
  cityId: number;
  isActive: boolean;
}

export interface Room {
  id: number;
  cinemaId: number;
  name: string;
  capacity: number;
  screenType: string;
  isActive: boolean;
}

export interface RoomSeatDto {
  id: number;
  roomId: number;
  seatTypeId: number;
  row: string;
  number: number;
  seatNumber: string;
  isAvailable: boolean;
  isActive: boolean;
  seatType?: {
    id: number;
    name: string;
    priceFactor: number;
    priceModifier: number;
  };
}

export interface Movie {
  id: number;
  title: string;
  synopsis: string;
  director: string;
  classification: string;
  duration: number;
  genres: string[];
  formats: string[];
  posterUrl: string;
  bannerUrl: string | null;
  trailerUrl: string | null;
}

export interface ShowtimeItem {
  id: number;
  movieId?: number;
  roomId?: number;
  startTime: string | null;
  endTime: string | null;
  price: number;
  format: string | null;
  availableSeats: number;
  totalSeats: number | null;
  room: {
    id: number;
    name: string;
    capacity?: number;
  } | null;
  cinema: {
    id: number;
    name: string;
    address: string;
  } | null;
}

export interface BillboardItem {
  movie: Movie;
  showtimes: ShowtimeItem[];
}

export interface SeatItem {
  id: number;
  row: string;
  number: number;
  seatNumber: string;
  seatType: string;
  priceFactor: number;
  price: number;
  status: 'AVAILABLE' | 'LOCKED' | 'SOLD';
  isMine: boolean;
}

export interface ShowtimeSeatMapResponse {
  functionId: number;
  movieId: number;
  movieTitle: string;
  cinemaName: string;
  roomName: string;
  startTime: string | null;
  basePrice: number;
  totalSeats: number;
  availableSeats: number;
  seats: SeatItem[];
}

export interface ReservationSeat {
  id: number;
  reservationId: number;
  seatId: number;
  status: string;
  price: number;
  seatNumber?: string;
  row?: string;
  number?: number;
  seatType?: string;
}

export interface Reservation {
  id: number;
  userId: number;
  functionId: number;
  status: 'ACTIVE' | 'EXPIRED' | 'RELEASED' | 'CONFIRMED';
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  seats?: ReservationSeat[];
  totalAmount?: number;
  movieTitle?: string;
  moviePoster?: string;
  cinemaName?: string;
  roomName?: string;
  startTime?: string | null;
  format?: string | null;
}
