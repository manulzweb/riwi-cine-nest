// src/modules/movies/movies.service.ts

import { Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';
import { MovieQueryDto } from './dto/movie-query.dto.js';
import { MovieResponseDto } from './dto/movie-response.dto.js';
import { MovieDao } from './dao/movie.dao.js';
import { MovieMapper } from './mappers/movie.mapper.js';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class MoviesService {
  constructor(private readonly movieDao: MovieDao) {}

  async findAll(
    query: MovieQueryDto,
  ): Promise<PaginatedResult<MovieResponseDto>> {
    const [data, total, page, limit] = await this.movieDao.findPaginated(query);

    return {
      data: MovieMapper.toResponseDtoList(data),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPremieres(limit = 10): Promise<MovieResponseDto[]> {
    const movies = await this.movieDao.findPremieres(limit);
    return MovieMapper.toResponseDtoList(movies);
  }

  async findById(id: number): Promise<MovieResponseDto> {
    const movie = await this.movieDao.findByIdWithFunctions(id);
    return MovieMapper.toResponseDto(movie);
  }

  async create(dto: CreateMovieDto): Promise<MovieResponseDto> {
    const entity = MovieMapper.toEntity(dto);
    const saved = await this.movieDao.save(entity);
    return MovieMapper.toResponseDto(saved);
  }

  async update(id: number, dto: UpdateMovieDto): Promise<MovieResponseDto> {
    const movie = await this.movieDao.findByIdWithFunctions(id);
    MovieMapper.applyUpdate(movie, dto);
    const updated = await this.movieDao.save(movie);
    return MovieMapper.toResponseDto(updated);
  }

  async updateStatus(id: number, isActive: boolean): Promise<MovieResponseDto> {
    const movie = await this.movieDao.findByIdWithFunctions(id);
    movie.isActive = isActive;
    movie.active = isActive;
    const updated = await this.movieDao.save(movie);
    return MovieMapper.toResponseDto(updated);
  }

  async delete(id: number): Promise<{ message: string }> {
    await this.updateStatus(id, false);
    return { message: `Película con ID ${id} desactivada correctamente` };
  }
}
