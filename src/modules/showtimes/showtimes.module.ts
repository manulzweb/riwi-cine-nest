// src/modules/showtimes/showtimes.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CinemaFunction } from './entities/cinema-function.entity';
import { Movie } from '../movies/entities/movie.entity';
import { Room } from '../cinemas/entities/room.entity';
import { Seat } from '../cinemas/entities/seat.entity';
import { ShowtimesService } from './showtimes.service';
import { ShowtimesController } from './showtimes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CinemaFunction, Movie, Room, Seat])],
  controllers: [ShowtimesController],
  providers: [ShowtimesService],
  exports: [ShowtimesService, TypeOrmModule],
})
export class ShowtimesModule {}
