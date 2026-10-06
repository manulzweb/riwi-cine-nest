// src/modules/cinemas/cinemas.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cinema } from './entities/cinema.entity.js';
import { Room } from './entities/room.entity.js';
import { SeatType } from './entities/seat-type.entity.js';
import { Seat } from './entities/seat.entity.js';
import { CinemasService } from './cinemas.service.js';
import { CinemasController } from './cinemas.controller.js';
import { CinemaDao } from './dao/cinema.dao.js';
import { RoomDao } from './dao/room.dao.js';
import { SeatTypeDao } from './dao/seat-type.dao.js';
import { SeatDao } from './dao/seat.dao.js';
import { CinemaMapper } from './mappers/cinema.mapper.js';
import { RoomMapper } from './mappers/room.mapper.js';
import { SeatMapper } from './mappers/seat.mapper.js';

@Module({
  imports: [TypeOrmModule.forFeature([Cinema, Room, SeatType, Seat])],
  controllers: [CinemasController],
  providers: [
    CinemasService,
    CinemaDao,
    RoomDao,
    SeatTypeDao,
    SeatDao,
    CinemaMapper,
    RoomMapper,
    SeatMapper,
  ],
  exports: [
    CinemasService,
    CinemaDao,
    RoomDao,
    SeatTypeDao,
    SeatDao,
    CinemaMapper,
    RoomMapper,
    SeatMapper,
  ],
})
export class CinemasModule {}
