import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity.js';
import { ReservationSeat } from './entities/reservation-seat.entity.js';

import { ReservationDao } from './dao/reservation.dao.js';
import { ReservationSeatDao } from './dao/reservation-seat.dao.js';
import { ReservationMapper } from './mappers/reservation.mapper.js';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, ReservationSeat])],
  providers: [ReservationDao, ReservationSeatDao, ReservationMapper],
  exports: [
    TypeOrmModule,
    ReservationDao,
    ReservationSeatDao,
    ReservationMapper,
  ],
})
export class ReservationsModule {}
