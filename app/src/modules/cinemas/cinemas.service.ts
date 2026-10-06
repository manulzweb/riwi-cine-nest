// src/modules/cinemas/cinemas.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCinemaDto } from './dto/create-cinema.dto.js';
import { UpdateCinemaDto } from './dto/update-cinema.dto.js';
import { CreateRoomDto } from './dto/create-room.dto.js';
import { GenerateSeatsDto } from './dto/generate-seats.dto.js';
import { CreateSeatTypeDto } from './dto/create-seat-type.dto.js';
import { CinemaDao } from './dao/cinema.dao.js';
import { RoomDao } from './dao/room.dao.js';
import { SeatTypeDao } from './dao/seat-type.dao.js';
import { SeatDao } from './dao/seat.dao.js';
import { CinemaMapper } from './mappers/cinema.mapper.js';
import { RoomMapper } from './mappers/room.mapper.js';
import { SeatMapper } from './mappers/seat.mapper.js';
import { CinemaResponseDto } from './dto/cinema-response.dto.js';
import { RoomResponseDto } from './dto/room-response.dto.js';
import { SeatResponseDto } from './dto/seat-response.dto.js';
import { Seat } from './entities/seat.entity.js';
import { SeatType } from './entities/seat-type.entity.js';

@Injectable()
export class CinemasService {
  constructor(
    private readonly cinemaDao: CinemaDao,
    private readonly roomDao: RoomDao,
    private readonly seatTypeDao: SeatTypeDao,
    private readonly seatDao: SeatDao,
  ) {}

  async findAll(cityId?: number): Promise<CinemaResponseDto[]> {
    const cinemas = await this.cinemaDao.findAllActive(cityId);
    return CinemaMapper.toResponseDtoList(cinemas);
  }

  async findById(id: number): Promise<CinemaResponseDto> {
    const cinema = await this.cinemaDao.findByIdWithRelations(id);
    return CinemaMapper.toResponseDto(cinema);
  }

  async createCinema(dto: CreateCinemaDto): Promise<CinemaResponseDto> {
    const entity = CinemaMapper.toEntity(dto);
    const saved = await this.cinemaDao.save(entity);
    return CinemaMapper.toResponseDto(saved);
  }

  async updateCinema(
    id: number,
    dto: UpdateCinemaDto,
  ): Promise<CinemaResponseDto> {
    const cinema = await this.cinemaDao.findByIdWithRelations(id);
    CinemaMapper.applyUpdate(cinema, dto);
    const updated = await this.cinemaDao.save(cinema);
    return CinemaMapper.toResponseDto(updated);
  }

  async updateCinemaStatus(
    id: number,
    isActive: boolean,
  ): Promise<CinemaResponseDto> {
    const cinema = await this.cinemaDao.findByIdWithRelations(id);
    cinema.isActive = isActive;
    const updated = await this.cinemaDao.save(cinema);
    return CinemaMapper.toResponseDto(updated);
  }

  async findRoomsByCinema(cinemaId: number): Promise<RoomResponseDto[]> {
    await this.cinemaDao.findByIdWithRelations(cinemaId);
    const rooms = await this.roomDao.findByCinemaId(cinemaId);
    return RoomMapper.toResponseDtoList(rooms);
  }

  async findRoomById(roomId: number) {
    const room = await this.roomDao.findOne({
      where: { id: roomId },
      relations: ['cinema'],
    });

    if (!room) {
      throw new NotFoundException(`Sala con ID ${roomId} no encontrada`);
    }

    return room;
  }

  async createRoom(
    cinemaId: number,
    dto: CreateRoomDto,
  ): Promise<RoomResponseDto> {
    await this.cinemaDao.findByIdWithRelations(cinemaId);
    const entity = RoomMapper.toEntity(dto, cinemaId);
    const saved = await this.roomDao.save(entity);
    return RoomMapper.toResponseDto(saved);
  }

  async getRoomSeats(roomId: number): Promise<SeatResponseDto[]> {
    await this.findRoomById(roomId);
    const seats = await this.seatDao.findByRoomId(roomId);
    return SeatMapper.toResponseDtoList(seats);
  }

  async generateSeats(
    roomId: number,
    dto: GenerateSeatsDto,
  ): Promise<{ message: string; count: number }> {
    const room = await this.findRoomById(roomId);

    let seatTypeId = dto.seatTypeId;
    if (!seatTypeId) {
      const defaultType = await this.seatTypeDao.findOne({
        where: { name: 'General' },
      });
      if (!defaultType) {
        const firstType = await this.seatTypeDao.findOne({
          where: {},
          order: { id: 'ASC' },
        });
        if (!firstType) {
          throw new BadRequestException(
            'No hay tipos de asiento configurados en el sistema',
          );
        }
        seatTypeId = firstType.id;
      } else {
        seatTypeId = defaultType.id;
      }
    }

    // Delete existing seats for the room to recreate layout cleanly
    await this.seatDao.deleteByRoomId(roomId);

    const seatsToInsert: Seat[] = [];
    for (let r = 0; r < dto.rows; r++) {
      const rowLetter = String.fromCharCode(65 + r); // A, B, C...
      for (let n = 1; n <= dto.seatsPerRow; n++) {
        const seat = new Seat();
        seat.roomId = roomId;
        seat.seatTypeId = seatTypeId;
        seat.row = rowLetter;
        seat.number = n;
        seat.isAvailable = true;
        seat.isActive = true;
        seatsToInsert.push(seat);
      }
    }

    await this.seatDao.saveMany(seatsToInsert);

    // Update room capacity
    room.capacity = seatsToInsert.length;
    await this.roomDao.save(room);

    return {
      message: `Se generaron ${seatsToInsert.length} asientos para la sala ${room.name}`,
      count: seatsToInsert.length,
    };
  }

  async getSeatTypes(): Promise<SeatType[]> {
    return this.seatTypeDao.findAll({
      order: { id: 'ASC' },
    });
  }

  async createSeatType(dto: CreateSeatTypeDto): Promise<SeatType> {
    const seatType = new SeatType();
    seatType.name = dto.name;
    seatType.description = dto.description ?? null;
    seatType.priceFactor = String(dto.priceFactor ?? '1.00');
    return this.seatTypeDao.save(seatType);
  }
}
