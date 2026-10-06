// src/modules/showtimes/showtimes.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CinemaFunction } from './entities/cinema-function.entity.js';
import { ShowtimesService } from './showtimes.service.js';
import { ShowtimesController } from './showtimes.controller.js';
import { CinemaFunctionDao } from './dao/cinema-function.dao.js';
import { ShowtimeMapper } from './mappers/showtime.mapper.js';
import { MoviesModule } from '../movies/movies.module.js';
import { CinemasModule } from '../cinemas/cinemas.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([CinemaFunction]),
    MoviesModule,
    CinemasModule,
  ],
  controllers: [ShowtimesController],
  providers: [ShowtimesService, CinemaFunctionDao, ShowtimeMapper],
  exports: [ShowtimesService, CinemaFunctionDao, ShowtimeMapper],
})
export class ShowtimesModule {}
