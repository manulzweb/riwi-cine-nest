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
      seatType: entity.seat?.seatType?.name,
    };
  }

  static toResponseDto(entity: Reservation): ReservationResponseDto {
    const seats = entity.seats?.map((s) => this.toSeatResponseDto(s)) || [];
    const totalAmount = seats.reduce((acc, s) => acc + (s.price || 0), 0);

    return {
      id: entity.id,
      userId: entity.userId,
      functionId: entity.functionId,
      status: entity.status,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      seats,
      totalAmount,
      movieTitle: entity.function?.movie?.title,
      moviePoster: entity.function?.movie?.posterUrl,
      cinemaName: entity.function?.roomRelation?.cinema?.name,
      roomName: entity.function?.roomRelation?.name,
      startTime: entity.function?.startTime,
      format: entity.function?.format,
    };
  }

  static toResponseDtoList(entities: Reservation[]): ReservationResponseDto[] {
    return entities.map((e) => this.toResponseDto(e));
  }
}
