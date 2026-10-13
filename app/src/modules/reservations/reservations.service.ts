// src/modules/reservations/reservations.service.ts

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CinemaFunctionDao } from '../showtimes/dao/cinema-function.dao.js';
import { SeatDao } from '../cinemas/dao/seat.dao.js';
import { ReservationDao } from './dao/reservation.dao.js';
import { ReservationSeatDao } from './dao/reservation-seat.dao.js';
import {
  Reservation,
  ReservationStatus,
} from './entities/reservation.entity.js';
import {
  ReservationSeat,
  ReservationSeatStatus,
} from './entities/reservation-seat.entity.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { ReservationResponseDto } from './dto/reservation-response.dto.js';
import { ReservationMapper } from './mappers/reservation.mapper.js';

export interface SeatAvailabilityItem {
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
  startTime: Date | null;
  basePrice: number;
  totalSeats: number;
  availableSeats: number;
  seats: SeatAvailabilityItem[];
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly reservationDao: ReservationDao,
    private readonly reservationSeatDao: ReservationSeatDao,
    private readonly functionDao: CinemaFunctionDao,
    private readonly seatDao: SeatDao,
  ) {}

  async create(
    userId: number,
    dto: CreateReservationDto,
  ): Promise<ReservationResponseDto> {
    const fn = await this.functionDao.findByIdWithDetails(dto.functionId);
    if (!fn || !fn.isActive) {
      throw new NotFoundException(
        `Función con ID ${dto.functionId} no encontrada o inactiva`,
      );
    }

    if (!fn.roomId) {
      throw new BadRequestException('La función no tiene sala asignada');
    }

    const roomSeats = await this.seatDao.findByRoomId(fn.roomId);
    const roomSeatMap = new Map(roomSeats.map((s) => [s.id, s]));

    for (const seatId of dto.seatIds) {
      if (!roomSeatMap.has(seatId)) {
        throw new BadRequestException(
          `La butaca con ID ${seatId} no pertenece a la sala de esta función`,
        );
      }
    }

    const savedReservationId = await this.dataSource.transaction(
      async (manager) => {
        const lockedOrSoldIds =
          await this.reservationSeatDao.findLockedOrSoldSeatIds(
            dto.functionId,
            manager,
          );
        const conflict = dto.seatIds.some((id) => lockedOrSoldIds.includes(id));
        if (conflict) {
          throw new ConflictException(
            'Uno o más asientos seleccionados ya han sido reservados o bloqueados por otro usuario',
          );
        }

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos de bloqueo TTL

        const reservation = manager.create(Reservation, {
          userId,
          functionId: dto.functionId,
          status: ReservationStatus.ACTIVE,
          expiresAt,
        });
        const savedRes = await manager.save(Reservation, reservation);

        const reservationSeats: ReservationSeat[] = dto.seatIds.map(
          (seatId) => {
            const seat = roomSeatMap.get(seatId)!;
            const factor = Number(seat.seatType?.priceFactor || 1.0);
            const price = (Number(fn.price) * factor).toFixed(2);

            return manager.create(ReservationSeat, {
              reservationId: savedRes.id,
              seatId,
              status: ReservationSeatStatus.LOCKED,
              price,
            });
          },
        );

        await manager.save(ReservationSeat, reservationSeats);
        return savedRes.id;
      },
    );

    const detailed =
      await this.reservationDao.findByIdWithDetails(savedReservationId);
    if (!detailed) {
      throw new NotFoundException('Error al recuperar la reserva creada');
    }

    return ReservationMapper.toResponseDto(detailed);
  }

  async getSeatAvailability(
    functionId: number,
    currentUserId?: number,
  ): Promise<ShowtimeSeatMapResponse> {
    const fn = await this.functionDao.findByIdWithDetails(functionId);
    if (!fn || !fn.isActive) {
      throw new NotFoundException(
        `Función con ID ${functionId} no encontrada o inactiva`,
      );
    }

    const seats = fn.roomId ? await this.seatDao.findByRoomId(fn.roomId) : [];
    const activeReservations =
      await this.reservationDao.findActiveByFunctionId(functionId);

    const seatStatusMap = new Map<
      number,
      { status: 'LOCKED' | 'SOLD'; isMine: boolean }
    >();

    for (const res of activeReservations) {
      const isMine = !!currentUserId && res.userId === currentUserId;
      const status: 'LOCKED' | 'SOLD' =
        res.status === ReservationStatus.CONFIRMED ? 'SOLD' : 'LOCKED';

      if (res.seats) {
        for (const rs of res.seats) {
          seatStatusMap.set(rs.seatId, { status, isMine });
        }
      }
    }

    const seatItems: SeatAvailabilityItem[] = seats.map((seat) => {
      const occupiedInfo = seatStatusMap.get(seat.id);
      const factor = Number(seat.seatType?.priceFactor || 1.0);
      const finalPrice = Number((Number(fn.price) * factor).toFixed(2));

      return {
        id: seat.id,
        row: seat.row,
        number: seat.number,
        seatNumber: `${seat.row}${seat.number}`,
        seatType: seat.seatType?.name || 'General',
        priceFactor: factor,
        price: finalPrice,
        status: occupiedInfo ? occupiedInfo.status : 'AVAILABLE',
        isMine: occupiedInfo ? occupiedInfo.isMine : false,
      };
    });

    const availableCount = seatItems.filter(
      (s) => s.status === 'AVAILABLE',
    ).length;

    return {
      functionId,
      movieId: fn.movie?.id || 0,
      movieTitle: fn.movie?.title || '',
      cinemaName: fn.roomRelation?.cinema?.name || '',
      roomName: fn.roomRelation?.name || '',
      startTime: fn.startTime,
      basePrice: Number(fn.price),
      totalSeats: seats.length,
      availableSeats: availableCount,
      seats: seatItems,
    };
  }

  async findMyReservations(userId: number): Promise<ReservationResponseDto[]> {
    const reservations = await this.reservationDao.findByUserId(userId);
    const now = new Date();

    for (const res of reservations) {
      if (
        res.status === ReservationStatus.ACTIVE &&
        res.expiresAt &&
        res.expiresAt < now
      ) {
        res.status = ReservationStatus.EXPIRED;
        await this.reservationDao.update(res.id, {
          status: ReservationStatus.EXPIRED,
        });
      }
    }

    return ReservationMapper.toResponseDtoList(reservations);
  }

  async findById(
    id: number,
    userId: number,
    isAdmin = false,
  ): Promise<ReservationResponseDto> {
    const res = await this.reservationDao.findByIdWithDetails(id);
    if (!res) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    if (!isAdmin && res.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para consultar esta reserva',
      );
    }

    return ReservationMapper.toResponseDto(res);
  }

  async confirm(id: number, userId: number): Promise<ReservationResponseDto> {
    const res = await this.reservationDao.findByIdWithDetails(id);
    if (!res) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    if (res.userId !== userId) {
      throw new ForbiddenException('No puedes confirmar reservas ajenas');
    }

    if (res.status !== ReservationStatus.ACTIVE) {
      throw new BadRequestException(
        `La reserva no está activa (estado actual: ${res.status})`,
      );
    }

    if (res.expiresAt && res.expiresAt < new Date()) {
      await this.reservationDao.update(id, {
        status: ReservationStatus.EXPIRED,
      });
      throw new ConflictException(
        'El tiempo de reserva ha expirado. Por favor, selecciona tus asientos nuevamente.',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(
        Reservation,
        { id },
        { status: ReservationStatus.CONFIRMED },
      );
      await manager.update(
        ReservationSeat,
        { reservationId: id },
        { status: ReservationSeatStatus.SOLD },
      );
    });

    const updated = await this.reservationDao.findByIdWithDetails(id);
    return ReservationMapper.toResponseDto(updated!);
  }

  async cancel(
    id: number,
    userId: number,
  ): Promise<{ message: string; id: number }> {
    const res = await this.reservationDao.findByIdWithDetails(id);
    if (!res) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    if (res.userId !== userId) {
      throw new ForbiddenException('No puedes cancelar reservas ajenas');
    }

    if (res.status === ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'No se puede cancelar directamente una reserva ya confirmada',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(
        Reservation,
        { id },
        { status: ReservationStatus.RELEASED },
      );
      await manager.update(
        ReservationSeat,
        { reservationId: id },
        { status: ReservationSeatStatus.RELEASED },
      );
    });

    return { message: 'Reserva cancelada y butacas liberadas con éxito', id };
  }
}
