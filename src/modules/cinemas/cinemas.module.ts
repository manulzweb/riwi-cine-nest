// src/modules/cinemas/cinemas.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cinema } from './entities/cinema.entity';
import { Room } from './entities/room.entity';
import { SeatType } from './entities/seat-type.entity';
import { Seat } from './entities/seat.entity';
import { CinemasService } from './cinemas.service';
import { CinemasController } from './cinemas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cinema, Room, SeatType, Seat])],
  controllers: [CinemasController],
  providers: [CinemasService],
  exports: [CinemasService, TypeOrmModule],
})
export class CinemasModule {}
