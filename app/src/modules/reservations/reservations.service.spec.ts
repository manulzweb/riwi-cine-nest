// src/modules/reservations/reservations.service.spec.ts

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReservationsService } from './reservations.service.js';
import { ReservationDao } from './dao/reservation.dao.js';
import { ReservationSeatDao } from './dao/reservation-seat.dao.js';
import { CinemaFunctionDao } from '../showtimes/dao/cinema-function.dao.js';
import { SeatDao } from '../cinemas/dao/seat.dao.js';
import { ReservationStatus } from './entities/reservation.entity.js';
import { ReservationSeatStatus } from './entities/reservation-seat.entity.js';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationDao: Partial<ReservationDao>;
  let reservationSeatDao: Partial<ReservationSeatDao>;
  let functionDao: Partial<CinemaFunctionDao>;
  let seatDao: Partial<SeatDao>;
  let dataSource: Partial<DataSource>;

  beforeEach(() => {
    reservationDao = {
      findByIdWithDetails: vi.fn(),
      findByUserId: vi.fn(),
      findActiveByFunctionId: vi.fn(),
      update: vi.fn(),
    };

    reservationSeatDao = {
      findLockedOrSoldSeatIds: vi.fn(),
    };

    functionDao = {
      findByIdWithDetails: vi.fn(),
    };

    seatDao = {
      findByRoomId: vi.fn(),
    };

    dataSource = {
      transaction: vi.fn(),
    };

    service = new ReservationsService(
      dataSource as DataSource,
      reservationDao as ReservationDao,
      reservationSeatDao as ReservationSeatDao,
      functionDao as CinemaFunctionDao,
      seatDao as SeatDao,
    );
  });

  describe('create', () => {
    it('debe lanzar NotFoundException si la función no existe o está inactiva', async () => {
      vi.mocked(functionDao.findByIdWithDetails!).mockResolvedValue(null as any);

      await expect(
        service.create(1, { functionId: 999, seatIds: [1, 2] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si una butaca no pertenece a la sala', async () => {
      vi.mocked(functionDao.findByIdWithDetails!).mockResolvedValue({
        id: 1,
        isActive: true,
        roomId: 10,
        price: '15000',
      } as any);

      vi.mocked(seatDao.findByRoomId!).mockResolvedValue([
        { id: 1, row: 'A', number: 1 },
      ] as any);

      await expect(
        service.create(1, { functionId: 1, seatIds: [1, 99] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe crear la reserva y bloquear las butacas satisfactoriamente', async () => {
      vi.mocked(functionDao.findByIdWithDetails!).mockResolvedValue({
        id: 1,
        isActive: true,
        roomId: 10,
        price: '15000',
        movie: { title: 'Inception' },
      } as any);

      vi.mocked(seatDao.findByRoomId!).mockResolvedValue([
        {
          id: 1,
          row: 'A',
          number: 1,
          seatType: { name: 'General', priceFactor: '1.0' },
        },
      ] as any);

      vi.mocked(dataSource.transaction!).mockImplementation(
        async (cb: any) => {
          vi.mocked(reservationSeatDao.findLockedOrSoldSeatIds!).mockResolvedValue(
            [],
          );
          const fakeManager = {
            create: vi.fn((entity, data) => data),
            save: vi.fn((entity, data) => {
              if (Array.isArray(data)) return data;
              return { id: 42, ...data };
            }),
          };
          return cb(fakeManager);
        },
      );

      vi.mocked(reservationDao.findByIdWithDetails!).mockResolvedValue({
        id: 42,
        userId: 1,
        functionId: 1,
        status: ReservationStatus.ACTIVE,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        seats: [
          {
            id: 100,
            reservationId: 42,
            seatId: 1,
            price: '15000.00',
            status: ReservationSeatStatus.LOCKED,
            seat: { row: 'A', number: 1 },
          },
        ],
        function: { movie: { title: 'Inception' } },
      } as any);

      const result = await service.create(1, {
        functionId: 1,
        seatIds: [1],
      });

      expect(result.id).toBe(42);
      expect(result.status).toBe(ReservationStatus.ACTIVE);
      expect(result.totalAmount).toBe(15000);
    });
  });

  describe('getSeatAvailability', () => {
    it('debe mapear correctamente los estados de las butacas (AVAILABLE, LOCKED, SOLD)', async () => {
      vi.mocked(functionDao.findByIdWithDetails!).mockResolvedValue({
        id: 1,
        isActive: true,
        roomId: 10,
        price: '20000',
        movie: { id: 5, title: 'Avatar' },
        roomRelation: { name: 'Sala 1', cinema: { name: 'Cinepolis' } },
      } as any);

      vi.mocked(seatDao.findByRoomId!).mockResolvedValue([
        {
          id: 1,
          row: 'A',
          number: 1,
          seatType: { name: 'General', priceFactor: '1.0' },
        },
        {
          id: 2,
          row: 'A',
          number: 2,
          seatType: { name: 'VIP', priceFactor: '1.5' },
        },
        {
          id: 3,
          row: 'A',
          number: 3,
          seatType: { name: 'General', priceFactor: '1.0' },
        },
      ] as any);

      vi.mocked(reservationDao.findActiveByFunctionId!).mockResolvedValue([
        {
          id: 10,
          userId: 99,
          status: ReservationStatus.ACTIVE,
          seats: [{ seatId: 1 }],
        },
        {
          id: 11,
          userId: 1,
          status: ReservationStatus.CONFIRMED,
          seats: [{ seatId: 2 }],
        },
      ] as any);

      const map = await service.getSeatAvailability(1, 1);

      expect(map.totalSeats).toBe(3);
      expect(map.availableSeats).toBe(1);
      expect(map.seats[0].status).toBe('LOCKED');
      expect(map.seats[0].isMine).toBe(false);
      expect(map.seats[1].status).toBe('SOLD');
      expect(map.seats[1].isMine).toBe(true);
      expect(map.seats[2].status).toBe('AVAILABLE');
    });
  });

  describe('confirm', () => {
    it('debe lanzar ForbiddenException si el usuario no es el dueño', async () => {
      vi.mocked(reservationDao.findByIdWithDetails!).mockResolvedValue({
        id: 1,
        userId: 2,
      } as any);

      await expect(service.confirm(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('debe lanzar ConflictException si la reserva expiró', async () => {
      vi.mocked(reservationDao.findByIdWithDetails!).mockResolvedValue({
        id: 1,
        userId: 1,
        status: ReservationStatus.ACTIVE,
        expiresAt: new Date(Date.now() - 10000), // Expirado
      } as any);

      await expect(service.confirm(1, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('cancel', () => {
    it('debe liberar las butacas y actualizar el estado a RELEASED', async () => {
      vi.mocked(reservationDao.findByIdWithDetails!).mockResolvedValue({
        id: 5,
        userId: 1,
        status: ReservationStatus.ACTIVE,
      } as any);

      vi.mocked(dataSource.transaction!).mockImplementation(
        async (cb: any) => {
          const fakeManager = {
            update: vi.fn(),
          };
          return cb(fakeManager);
        },
      );

      const result = await service.cancel(5, 1);
      expect(result.id).toBe(5);
      expect(result.message).toContain('liberadas con éxito');
    });
  });
});
