// src/modules/movies/movies.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity.js';
import { MoviesController } from './movies.controller.js';
import { MoviesService } from './movies.service.js';
import { MovieDao } from './dao/movie.dao.js';
import { MovieMapper } from './mappers/movie.mapper.js';

@Module({
  imports: [TypeOrmModule.forFeature([Movie])],
  controllers: [MoviesController],
  providers: [MoviesService, MovieDao, MovieMapper],
  exports: [MoviesService, MovieDao, MovieMapper],
})
export class MoviesModule {}
