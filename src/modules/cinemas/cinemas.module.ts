import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cinema } from './entities/cinema.entity';
import { Room } from './entities/room.entity';
import { SeatType } from './entities/seat-type.entity';
import { Seat } from './entities/seat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cinema, Room, SeatType, Seat])],
  exports: [TypeOrmModule],
})
export class CinemasModule {}
