// src/modules/showtimes/showtimes.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShowtimeDto } from './dto/create-showtime.dto.js';
import { UpdateShowtimeDto } from './dto/update-showtime.dto.js';
import { ShowtimeQueryDto } from './dto/showtime-query.dto.js';
import { BillboardQueryDto } from './dto/billboard-query.dto.js';
import { CinemaFunctionDao } from './dao/cinema-function.dao.js';
import { MovieDao } from '../movies/dao/movie.dao.js';
import { RoomDao } from '../cinemas/dao/room.dao.js';
import { SeatDao } from '../cinemas/dao/seat.dao.js';
import { ShowtimeMapper } from './mappers/showtime.mapper.js';
import { ShowtimeResponseDto } from './dto/showtime-response.dto.js';

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
    private readonly functionDao: CinemaFunctionDao,
    private readonly movieDao: MovieDao,
    private readonly roomDao: RoomDao,
    private readonly seatDao: SeatDao,
  ) {}

  async findAll(query: ShowtimeQueryDto): Promise<ShowtimeResponseDto[]> {
    const functions = await this.functionDao.findWithFilters(query);
    return ShowtimeMapper.toResponseDtoList(functions);
  }

  async getBillboard(query: BillboardQueryDto): Promise<BillboardItem[]> {
    const functions = await this.functionDao.findForBillboard(query);

    const movieMap = new Map<number, BillboardItem>();

    for (const fn of functions) {
      if (!fn.movie) continue;

      if (!movieMap.has(fn.movie.id)) {
        movieMap.set(fn.movie.id, {
          movie: {
            id: fn.movie.id,
            title: fn.movie.title,
            synopsis: fn.movie.synopsis,
            director: fn.movie.director,
            classification: fn.movie.classification,
            duration: fn.movie.duration,
            genres: fn.movie.genres || [],
            formats: fn.movie.formats || [],
            posterUrl: fn.movie.posterUrl,
            bannerUrl: fn.movie.bannerUrl || null,
            trailerUrl: fn.movie.trailerUrl || null,
          },
          showtimes: [],
        });
      }

      const totalSeats = fn.roomRelation ? fn.roomRelation.capacity : null;

      movieMap.get(fn.movie.id)!.showtimes.push({
        id: fn.id,
        startTime: fn.startTime,
        endTime: fn.endTime,
        price: Number(fn.price),
        format: fn.format,
        availableSeats: totalSeats ?? 0,
        totalSeats,
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

  async findById(id: number): Promise<any> {
    const fn = await this.functionDao.findByIdWithDetails(id);
    const seats = fn.roomId ? await this.seatDao.findByRoomId(fn.roomId) : [];
    const dto = ShowtimeMapper.toResponseDto(fn);
    return {
      ...dto,
      seats,
      totalSeats: fn.roomRelation?.capacity || seats.length,
      availableSeats: fn.roomRelation?.capacity || seats.length,
    };
  }

  async getAvailableSeats(functionId: number): Promise<{
    functionId: number;
    totalSeats: number;
    availableSeats: number;
    seats: any[];
  }> {
    const showtime = await this.functionDao.findByIdWithDetails(functionId);
    const seats = showtime.roomId
      ? await this.seatDao.findByRoomId(showtime.roomId)
      : [];

    return {
      functionId,
      totalSeats: seats.length,
      availableSeats: seats.length,
      seats: seats.map((s) => ({
        id: s.id,
        row: s.row,
        number: s.number,
        seatNumber: `${s.row}${s.number}`,
        seatType: s.seatType?.name || 'General',
        priceModifier: Number(s.seatType?.priceFactor || 1.0),
        finalPrice:
          Number(showtime.price) * Number(s.seatType?.priceFactor || 1.0),
        isAvailable: s.isAvailable,
      })),
    };
  }

  async create(dto: CreateShowtimeDto): Promise<any> {
    const movie = await this.movieDao.findOne({
      where: { id: dto.movieId, isActive: true },
    });
    if (!movie) {
      throw new NotFoundException(
        `Película con ID ${dto.movieId} no encontrada`,
      );
    }

    const room = await this.roomDao.findOne({
      where: { id: dto.roomId, isActive: true },
    });
    if (!room) {
      throw new NotFoundException(`Sala con ID ${dto.roomId} no encontrada`);
    }

    const startTime = new Date(dto.startTime);
    if (isNaN(startTime.getTime())) {
      throw new BadRequestException('Fecha y hora de inicio inválida');
    }

    const durationMs = (movie.duration + 20) * 60 * 1000;
    const endTime = dto.endTime
      ? new Date(dto.endTime)
      : new Date(startTime.getTime() + durationMs);

    if (endTime <= startTime) {
      throw new BadRequestException(
        'La hora de finalización debe ser posterior a la de inicio',
      );
    }

    const overlapping = await this.functionDao.findOverlapping(
      dto.roomId,
      startTime,
      endTime,
    );
    if (overlapping) {
      throw new ConflictException(
        'Ya existe una función programada en esa sala para ese horario (con buffer de 20 min)',
      );
    }

    const entity = ShowtimeMapper.toEntity(dto, endTime);
    const saved = await this.functionDao.save(entity);

    return {
      ...ShowtimeMapper.toResponseDto(saved),
      id: saved.id,
      endTime: saved.endTime,
      format: (room as any).format || dto.format || '2D',
      totalSeats: room.capacity,
      availableSeats: room.capacity,
    };
  }

  async update(
    id: number,
    dto: UpdateShowtimeDto,
  ): Promise<ShowtimeResponseDto> {
    const fn = await this.functionDao.findByIdWithDetails(id);

    if (dto.movieId !== undefined) {
      const movie = await this.movieDao.findOne({
        where: { id: dto.movieId, isActive: true },
      });
      if (!movie) throw new NotFoundException(`Película no encontrada`);
      fn.movieId = dto.movieId;
    }

    if (dto.roomId !== undefined) {
      const room = await this.roomDao.findOne({
        where: { id: dto.roomId, isActive: true },
      });
      if (!room) throw new NotFoundException(`Sala no encontrada`);
      fn.roomId = dto.roomId;
    }

    if (dto.startTime !== undefined) {
      fn.startTime = new Date(dto.startTime);
    }
    if (dto.endTime !== undefined) {
      fn.endTime = new Date(dto.endTime);
    }
    if (dto.price !== undefined) {
      fn.price = dto.price;
    }
    if (dto.format !== undefined) {
      fn.format = dto.format;
    }
    if (dto.isActive !== undefined) {
      fn.isActive = dto.isActive;
    }

    const updated = await this.functionDao.save(fn);
    return ShowtimeMapper.toResponseDto(updated);
  }

  async updateStatus(
    id: number,
    isActive: boolean,
  ): Promise<ShowtimeResponseDto> {
    const fn = await this.functionDao.findByIdWithDetails(id);
    fn.isActive = isActive;
    const updated = await this.functionDao.save(fn);
    return ShowtimeMapper.toResponseDto(updated);
  }

  async delete(id: number): Promise<{ message: string }> {
    await this.updateStatus(id, false);
    return { message: `Función con ID ${id} desactivada correctamente` };
  }
}
