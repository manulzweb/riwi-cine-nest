// src/modules/showtimes/showtimes.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CinemaFunction } from './entities/cinema-function.entity';
import { Movie } from '../movies/entities/movie.entity';
import { Room } from '../cinemas/entities/room.entity';
import { Seat } from '../cinemas/entities/seat.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { ShowtimeQueryDto } from './dto/showtime-query.dto';
import { BillboardQueryDto } from './dto/billboard-query.dto';

export interface BillboardItem {
  movie: {
    id: number;
    title: string;
    synopsis: string;
    director: string;
    classification: string;
    duration: number;
    genres: string[];
    formats: string[];
    posterUrl: string;
    bannerUrl: string | null;
    trailerUrl: string | null;
  };
  showtimes: {
    id: number;
    startTime: Date | null;
    endTime: Date | null;
    price: number;
    format: string | null;
    availableSeats: number;
    totalSeats: number | null;
    room: {
      id: number;
      name: string;
    } | null;
    cinema: {
      id: number;
      name: string;
      address: string;
    } | null;
  }[];
}

@Injectable()
export class ShowtimesService {
  constructor(
    @InjectRepository(CinemaFunction)
    private readonly functionsRepository: Repository<CinemaFunction>,
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    @InjectRepository(Seat)
    private readonly seatsRepository: Repository<Seat>,
  ) {}

  async findAll(query: ShowtimeQueryDto): Promise<CinemaFunction[]> {
    const qb = this.functionsRepository
      .createQueryBuilder('fn')
      .leftJoinAndSelect('fn.movie', 'movie')
      .leftJoinAndSelect('fn.roomRelation', 'room')
      .leftJoinAndSelect('room.cinema', 'cinema')
      .where('fn.isActive = true');

    if (query.movieId) {
      qb.andWhere('fn.movieId = :movieId', { movieId: query.movieId });
    }

    if (query.roomId) {
      qb.andWhere('fn.roomId = :roomId', { roomId: query.roomId });
    }

    if (query.cinemaId) {
      qb.andWhere('room.cinemaId = :cinemaId', { cinemaId: query.cinemaId });
    }

    if (query.cityId) {
      qb.andWhere('cinema.cityId = :cityId', { cityId: query.cityId });
    }

    if (query.format) {
      qb.andWhere('fn.format = :format', { format: query.format });
    }

    if (query.date) {
      const startOfDay = new Date(`${query.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${query.date}T23:59:59.999Z`);
      qb.andWhere('fn.startTime BETWEEN :startOfDay AND :endOfDay', {
        startOfDay,
        endOfDay,
      });
    }

    return qb.orderBy('fn.startTime', 'ASC').getMany();
  }

  async getBillboard(query: BillboardQueryDto): Promise<BillboardItem[]> {
    const qb = this.functionsRepository
      .createQueryBuilder('fn')
      .leftJoinAndSelect('fn.movie', 'movie')
      .leftJoinAndSelect('fn.roomRelation', 'room')
      .leftJoinAndSelect('room.cinema', 'cinema')
      .where('fn.isActive = true')
      .andWhere('movie.isActive = true');

    if (query.cinemaId) {
      qb.andWhere('room.cinemaId = :cinemaId', { cinemaId: query.cinemaId });
    }

    if (query.cityId) {
      qb.andWhere('cinema.cityId = :cityId', { cityId: query.cityId });
    }

    if (query.movieId) {
      qb.andWhere('fn.movieId = :movieId', { movieId: query.movieId });
    }

    if (query.date) {
      const startOfDay = new Date(`${query.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${query.date}T23:59:59.999Z`);
      qb.andWhere('fn.startTime BETWEEN :startOfDay AND :endOfDay', {
        startOfDay,
        endOfDay,
      });
    } else {
      // Default: showtimes from now onwards (or today)
      const now = new Date();
      qb.andWhere('fn.startTime >= :now', { now });
    }

    const functions = await qb
      .orderBy('movie.title', 'ASC')
      .addOrderBy('fn.startTime', 'ASC')
      .getMany();

    // Group by movie
    const movieMap = new Map<number, BillboardItem>();

    for (const fn of functions) {
      const movie = fn.movie;
      if (!movie) continue;

      if (!movieMap.has(movie.id)) {
        movieMap.set(movie.id, {
          movie: {
            id: movie.id,
            title: movie.title,
            synopsis: movie.synopsis,
            director: movie.director,
            classification: movie.classification,
            duration: movie.duration,
            genres: movie.genres || [],
            formats: movie.formats || [],
            posterUrl: movie.posterUrl,
            bannerUrl: movie.bannerUrl,
            trailerUrl: movie.trailerUrl,
          },
          showtimes: [],
        });
      }

      movieMap.get(movie.id)!.showtimes.push({
        id: fn.id,
        startTime: fn.startTime,
        endTime: fn.endTime,
        price: fn.price,
        format: fn.format,
        availableSeats: fn.availableSeats,
        totalSeats: fn.totalSeats,
        room: fn.roomRelation
          ? {
              id: fn.roomRelation.id,
              name: fn.roomRelation.name,
            }
          : null,
        cinema: fn.roomRelation?.cinema
          ? {
              id: fn.roomRelation.cinema.id,
              name: fn.roomRelation.cinema.name,
              address: fn.roomRelation.cinema.address,
            }
          : null,
      });
    }

    return Array.from(movieMap.values());
  }

  async findById(id: number): Promise<CinemaFunction & { seats?: Seat[] }> {
    const fn = await this.functionsRepository.findOne({
      where: { id },
      relations: ['movie', 'roomRelation', 'roomRelation.cinema'],
    });

    if (!fn) {
      throw new NotFoundException(`Función con ID ${id} no encontrada`);
    }

    let seats: Seat[] = [];
    if (fn.roomId) {
      seats = await this.seatsRepository.find({
        where: { roomId: fn.roomId, isActive: true },
        relations: ['seatType'],
        order: { row: 'ASC', number: 'ASC' },
      });
    }

    return {
      ...fn,
      seats,
    };
  }

  async create(dto: CreateShowtimeDto): Promise<CinemaFunction> {
    const movie = await this.moviesRepository.findOne({
      where: { id: dto.movieId, isActive: true },
    });
    if (!movie) {
      throw new NotFoundException(
        `Película con ID ${dto.movieId} no encontrada o inactiva`,
      );
    }

    const room = await this.roomsRepository.findOne({
      where: { id: dto.roomId, isActive: true },
    });
    if (!room) {
      throw new NotFoundException(
        `Sala con ID ${dto.roomId} no encontrada o inactiva`,
      );
    }

    const startTime = new Date(dto.startTime);
    if (isNaN(startTime.getTime())) {
      throw new BadRequestException('Formato de fecha de inicio inválido');
    }

    let endTime: Date;
    if (dto.endTime) {
      endTime = new Date(dto.endTime);
      if (isNaN(endTime.getTime())) {
        throw new BadRequestException(
          'Formato de fecha de finalización inválido',
        );
      }
    } else {
      // Calculate end time: startTime + duration (minutes) + 20 minutes buffer
      endTime = new Date(
        startTime.getTime() + (movie.duration + 20) * 60 * 1000,
      );
    }

    if (endTime <= startTime) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Overlap validation: check for conflicting showtimes in the same room
    await this.validateRoomSchedule(room.id, startTime, endTime);

    const cinemaFunction = this.functionsRepository.create({
      movieId: movie.id,
      roomId: room.id,
      startTime,
      endTime,
      price: dto.price,
      format: dto.format || room.format,
      room: room.name,
      totalSeats: room.capacity,
      availableSeats: room.capacity,
      active: true,
      isActive: true,
    });

    return this.functionsRepository.save(cinemaFunction);
  }

  async update(id: number, dto: UpdateShowtimeDto): Promise<CinemaFunction> {
    const fn = await this.functionsRepository.findOne({
      where: { id },
      relations: ['movie', 'roomRelation'],
    });

    if (!fn) {
      throw new NotFoundException(`Función con ID ${id} no encontrada`);
    }

    const roomId = dto.roomId ?? fn.roomId;
    if (!roomId) {
      throw new BadRequestException('La función debe tener una sala asignada');
    }

    const startTime = dto.startTime ? new Date(dto.startTime) : fn.startTime;
    let endTime = dto.endTime ? new Date(dto.endTime) : fn.endTime;

    if (startTime && !endTime && fn.movie) {
      endTime = new Date(
        startTime.getTime() + (fn.movie.duration + 20) * 60 * 1000,
      );
    }

    if (startTime && endTime && (dto.startTime || dto.endTime || dto.roomId)) {
      if (endTime <= startTime) {
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la fecha de inicio',
        );
      }
      await this.validateRoomSchedule(roomId, startTime, endTime, id);
    }

    if (dto.movieId !== undefined) fn.movieId = dto.movieId;
    if (dto.roomId !== undefined) fn.roomId = dto.roomId;
    if (startTime !== null && startTime !== undefined) fn.startTime = startTime;
    if (endTime !== null && endTime !== undefined) fn.endTime = endTime;
    if (dto.price !== undefined) fn.price = dto.price;
    if (dto.format !== undefined) fn.format = dto.format;
    if (dto.isActive !== undefined) {
      fn.isActive = dto.isActive;
      fn.active = dto.isActive;
    }

    return this.functionsRepository.save(fn);
  }

  async updateStatus(id: number, isActive: boolean): Promise<CinemaFunction> {
    const fn = await this.functionsRepository.findOne({ where: { id } });
    if (!fn) {
      throw new NotFoundException(`Función con ID ${id} no encontrada`);
    }

    fn.isActive = isActive;
    fn.active = isActive;
    return this.functionsRepository.save(fn);
  }

  async delete(id: number): Promise<{ message: string }> {
    await this.updateStatus(id, false);
    return { message: `Función con ID ${id} desactivada correctamente` };
  }

  /**
   * Validates that there are no overlapping active functions in the given room.
   * Throws ConflictException if an overlap is detected.
   */
  async validateRoomSchedule(
    roomId: number,
    startTime: Date,
    endTime: Date,
    excludeFunctionId?: number,
  ): Promise<void> {
    const qb = this.functionsRepository
      .createQueryBuilder('fn')
      .where('fn.roomId = :roomId', { roomId })
      .andWhere('fn.isActive = true')
      .andWhere('fn.startTime < :endTime', { endTime })
      .andWhere('fn.endTime > :startTime', { startTime });

    if (excludeFunctionId) {
      qb.andWhere('fn.id != :excludeFunctionId', { excludeFunctionId });
    }

    const overlap = await qb.getOne();

    if (overlap) {
      throw new ConflictException({
        statusCode: 409,
        code: 'SHOWTIME_ROOM_OVERLAP',
        message:
          'La sala ya tiene una función asignada que se solapa con este horario',
        details: {
          conflictingFunctionId: overlap.id,
          startTime: overlap.startTime,
          endTime: overlap.endTime,
        },
      });
    }
  }
}
