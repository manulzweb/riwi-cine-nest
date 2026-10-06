import { CinemaFunction } from '../entities/cinema-function.entity.js';
import { CreateShowtimeDto } from '../dto/create-showtime.dto.js';
import { ShowtimeResponseDto } from '../dto/showtime-response.dto.js';
import { BaseMapper } from '../../../common/mappers/base-mapper.interface.js';

export class ShowtimeMapper implements BaseMapper<
  CinemaFunction,
  CreateShowtimeDto,
  ShowtimeResponseDto
> {
  static toEntity(dto: CreateShowtimeDto, endTime: Date): CinemaFunction {
    const fn = new CinemaFunction();
    fn.movieId = dto.movieId;
    fn.roomId = dto.roomId;
    fn.startTime = new Date(dto.startTime);
    fn.endTime = endTime;
    fn.price = dto.price;
    fn.format = dto.format || '2D';
    fn.isActive = true;
    return fn;
  }

  static toResponseDto(entity: CinemaFunction): ShowtimeResponseDto {
    return {
      id: entity.id,
      movieId: entity.movieId,
      roomId: entity.roomId,
      startTime: entity.startTime,
      endTime: entity.endTime,
      price: Number(entity.price),
      format: entity.format,
      isActive: entity.isActive,
      movie: entity.movie
        ? {
            id: entity.movie.id,
            title: entity.movie.title,
            duration: entity.movie.duration,
            posterUrl: entity.movie.posterUrl,
          }
        : undefined,
      room: entity.roomRelation
        ? {
            id: entity.roomRelation.id,
            name: entity.roomRelation.name,
            cinemaId: entity.roomRelation.cinemaId,
          }
        : undefined,
      cinema: entity.roomRelation?.cinema
        ? {
            id: entity.roomRelation.cinema.id,
            name: entity.roomRelation.cinema.name,
            address: entity.roomRelation.cinema.address,
          }
        : undefined,
    };
  }

  static toResponseDtoList(entities: CinemaFunction[]): ShowtimeResponseDto[] {
    return entities.map((e) => this.toResponseDto(e));
  }

  toEntity(dto: CreateShowtimeDto): CinemaFunction {
    return ShowtimeMapper.toEntity(dto, new Date(dto.startTime));
  }

  toResponseDto(entity: CinemaFunction): ShowtimeResponseDto {
    return ShowtimeMapper.toResponseDto(entity);
  }

  toResponseDtoList(entities: CinemaFunction[]): ShowtimeResponseDto[] {
    return ShowtimeMapper.toResponseDtoList(entities);
  }
}
