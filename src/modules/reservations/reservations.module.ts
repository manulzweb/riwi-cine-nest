import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationSeat } from './entities/reservation-seat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, ReservationSeat])],
  exports: [TypeOrmModule],
})
export class ReservationsModule {}
