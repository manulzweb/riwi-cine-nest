// src/modules/movies/movies.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieQueryDto } from './dto/movie-query.dto';

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
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  async findAll(query: MovieQueryDto): Promise<PaginatedResult<Movie>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const qb = this.moviesRepository
      .createQueryBuilder('movie')
      .where('movie.isActive = true');

    if (query.search) {
      qb.andWhere(
        '(LOWER(movie.title) LIKE :search OR LOWER(movie.director) LIKE :search OR LOWER(movie.synopsis) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    if (query.genre) {
      qb.andWhere(
        '(LOWER(movie.genre) = :genre OR :genreRaw = ANY(movie.genres))',
        { genre: query.genre.toLowerCase(), genreRaw: query.genre },
      );
    }

    if (query.format) {
      qb.andWhere(':format = ANY(movie.formats)', { format: query.format });
    }

    qb.orderBy('movie.releaseDate', 'DESC')
      .addOrderBy('movie.title', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPremieres(limit = 10): Promise<Movie[]> {
    return this.moviesRepository
      .createQueryBuilder('movie')
      .where('movie.isActive = true')
      .andWhere("movie.releaseDate >= CURRENT_DATE - INTERVAL '60 days'")
      .orderBy('movie.releaseDate', 'DESC')
      .take(limit)
      .getMany();
  }

  async findById(id: number): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({
      where: { id },
      relations: ['functions'],
    });

    if (!movie) {
      throw new NotFoundException(`Película con ID ${id} no encontrada`);
    }

    return movie;
  }

  async create(dto: CreateMovieDto): Promise<Movie> {
    const movie = this.moviesRepository.create({
      title: dto.title,
      synopsis: dto.synopsis,
      director: dto.director,
      actors: dto.actors || [],
      genres: dto.genres || (dto.genre ? [dto.genre] : []),
      languages: dto.languages || (dto.language ? [dto.language] : ['Español']),
      formats: dto.formats || ['2D'],
      duration: dto.duration,
      classification: dto.classification,
      releaseDate: dto.releaseDate,
      posterUrl: dto.posterUrl,
      bannerUrl: dto.bannerUrl || null,
      trailerUrl: dto.trailerUrl || null,
      genre: dto.genre || (dto.genres && dto.genres[0]) || null,
      language: dto.language || (dto.languages && dto.languages[0]) || null,
      isSubtitled: dto.isSubtitled ?? false,
      rating: dto.rating ?? 0,
      averageRating: '0.0',
      active: true,
      isActive: true,
    });

    return this.moviesRepository.save(movie);
  }

  async update(id: number, dto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.findById(id);

    if (dto.title !== undefined) movie.title = dto.title;
    if (dto.synopsis !== undefined) movie.synopsis = dto.synopsis;
    if (dto.director !== undefined) movie.director = dto.director;
    if (dto.actors !== undefined) movie.actors = dto.actors;
    if (dto.genres !== undefined) movie.genres = dto.genres;
    if (dto.languages !== undefined) movie.languages = dto.languages;
    if (dto.formats !== undefined) movie.formats = dto.formats;
    if (dto.duration !== undefined) movie.duration = dto.duration;
    if (dto.classification !== undefined)
      movie.classification = dto.classification;
    if (dto.releaseDate !== undefined) movie.releaseDate = dto.releaseDate;
    if (dto.posterUrl !== undefined) movie.posterUrl = dto.posterUrl;
    if (dto.bannerUrl !== undefined) movie.bannerUrl = dto.bannerUrl;
    if (dto.trailerUrl !== undefined) movie.trailerUrl = dto.trailerUrl;
    if (dto.genre !== undefined) movie.genre = dto.genre;
    if (dto.language !== undefined) movie.language = dto.language;
    if (dto.isSubtitled !== undefined) movie.isSubtitled = dto.isSubtitled;
    if (dto.rating !== undefined) movie.rating = dto.rating;

    if (dto.isActive !== undefined) {
      movie.isActive = dto.isActive;
      movie.active = dto.isActive;
    }

    return this.moviesRepository.save(movie);
  }

  async updateStatus(id: number, isActive: boolean): Promise<Movie> {
    const movie = await this.findById(id);
    movie.isActive = isActive;
    movie.active = isActive;
    return this.moviesRepository.save(movie);
  }

  async delete(id: number): Promise<{ message: string }> {
    await this.updateStatus(id, false);
    return { message: `Película con ID ${id} desactivada correctamente` };
  }
}
