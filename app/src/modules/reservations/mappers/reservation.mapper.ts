import { Reservation } from '../entities/reservation.entity.js';
import { ReservationSeat } from '../entities/reservation-seat.entity.js';
import {
  ReservationResponseDto,
  ReservationSeatResponseDto,
} from '../dto/reservation-response.dto.js';

export class ReservationMapper {
  static toSeatResponseDto(
    entity: ReservationSeat,
  ): ReservationSeatResponseDto {
    return {
      id: entity.id,
      reservationId: entity.reservationId,
      seatId: entity.seatId,
      status: entity.status,
      price: Number(entity.price),
      seatNumber: entity.seat
        ? `${entity.seat.row}${entity.seat.number}`
        : undefined,
      row: entity.seat?.row,
      number: entity.seat?.number,
    };
  }

  static toResponseDto(entity: Reservation): ReservationResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      functionId: entity.functionId,
      status: entity.status,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      seats: entity.seats?.map((s) => this.toSeatResponseDto(s)),
      movieTitle: entity.function?.movie?.title,
    };
  }

  static toResponseDtoList(entities: Reservation[]): ReservationResponseDto[] {
    return entities.map((e) => this.toResponseDto(e));
  }
}
