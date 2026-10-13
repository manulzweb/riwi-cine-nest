// src/modules/reservations/reservations.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationSeat } from './entities/reservation-seat.entity.js';
import { ReservationDao } from './dao/reservation.dao.js';
import { ReservationSeatDao } from './dao/reservation-seat.dao.js';
import { ReservationMapper } from './mappers/reservation.mapper.js';
import { ReservationsService } from './reservations.service.js';
import { ReservationsController } from './reservations.controller.js';
import { ShowtimesModule } from '../showtimes/showtimes.module.js';
import { CinemasModule } from '../cinemas/cinemas.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ReservationSeat]),
    ShowtimesModule,
    CinemasModule,
  ],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    ReservationDao,
    ReservationSeatDao,
    ReservationMapper,
  ],
  exports: [
    TypeOrmModule,
    ReservationsService,
    ReservationDao,
    ReservationSeatDao,
    ReservationMapper,
  ],
})
export class ReservationsModule {}
