import { Movie } from '../entities/movie.entity.js';
import { CreateMovieDto } from '../dto/create-movie.dto.js';
import { UpdateMovieDto } from '../dto/update-movie.dto.js';
import { MovieResponseDto } from '../dto/movie-response.dto.js';
import { BaseMapper } from '../../../common/mappers/base-mapper.interface.js';

export class MovieMapper implements BaseMapper<
  Movie,
  CreateMovieDto,
  MovieResponseDto
> {
  static toEntity(dto: CreateMovieDto): Movie {
    const movie = new Movie();
    movie.title = dto.title;
    movie.synopsis = dto.synopsis;
    movie.director = dto.director;
    movie.actors = dto.actors || [];
    movie.genres = dto.genres || (dto.genre ? [dto.genre] : []);
    movie.languages =
      dto.languages || (dto.language ? [dto.language] : ['Español']);
    movie.formats = dto.formats || ['2D'];
    movie.duration = dto.duration;
    movie.classification = dto.classification;
    movie.releaseDate = dto.releaseDate;
    movie.posterUrl = dto.posterUrl;
    movie.bannerUrl = dto.bannerUrl || null;
    movie.trailerUrl = dto.trailerUrl || null;
    movie.genre = dto.genre || (dto.genres && dto.genres[0]) || null;
    movie.language =
      dto.language || (dto.languages && dto.languages[0]) || null;
    movie.isSubtitled = dto.isSubtitled ?? false;
    movie.rating = dto.rating ?? 0;
    movie.averageRating = '0.0';
    movie.active = true;
    movie.isActive = true;
    return movie;
  }

  static applyUpdate(entity: Movie, dto: UpdateMovieDto): Movie {
    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.synopsis !== undefined) entity.synopsis = dto.synopsis;
    if (dto.director !== undefined) entity.director = dto.director;
    if (dto.actors !== undefined) entity.actors = dto.actors;
    if (dto.genres !== undefined) entity.genres = dto.genres;
    if (dto.languages !== undefined) entity.languages = dto.languages;
    if (dto.formats !== undefined) entity.formats = dto.formats;
    if (dto.duration !== undefined) entity.duration = dto.duration;
    if (dto.classification !== undefined)
      entity.classification = dto.classification;
    if (dto.releaseDate !== undefined) entity.releaseDate = dto.releaseDate;
    if (dto.posterUrl !== undefined) entity.posterUrl = dto.posterUrl;
    if (dto.bannerUrl !== undefined) entity.bannerUrl = dto.bannerUrl;
    if (dto.trailerUrl !== undefined) entity.trailerUrl = dto.trailerUrl;
    if (dto.genre !== undefined) entity.genre = dto.genre;
    if (dto.language !== undefined) entity.language = dto.language;
    if (dto.isSubtitled !== undefined) entity.isSubtitled = dto.isSubtitled;
    if (dto.rating !== undefined) entity.rating = dto.rating;

    if (dto.isActive !== undefined) {
      entity.isActive = dto.isActive;
      entity.active = dto.isActive;
    }
    return entity;
  }

  static toResponseDto(entity: Movie): MovieResponseDto {
    return {
      id: entity.id,
      title: entity.title,
      synopsis: entity.synopsis,
      director: entity.director,
      actors: entity.actors || [],
      genres: entity.genres || [],
      languages: entity.languages || [],
      formats: entity.formats || [],
      duration: entity.duration,
      classification: entity.classification,
      releaseDate: entity.releaseDate,
      posterUrl: entity.posterUrl,
      bannerUrl: entity.bannerUrl,
      trailerUrl: entity.trailerUrl,
      averageRating: entity.averageRating,
      active: entity.active,
      isActive: entity.isActive,
      genre: entity.genre,
      language: entity.language,
      isSubtitled: entity.isSubtitled,
      rating: entity.rating,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseDtoList(entities: Movie[]): MovieResponseDto[] {
    return entities.map((e) => this.toResponseDto(e));
  }

  toEntity(dto: CreateMovieDto): Movie {
    return MovieMapper.toEntity(dto);
  }

  toResponseDto(entity: Movie): MovieResponseDto {
    return MovieMapper.toResponseDto(entity);
  }

  toResponseDtoList(entities: Movie[]): MovieResponseDto[] {
    return MovieMapper.toResponseDtoList(entities);
  }
}
