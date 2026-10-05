// src/modules/cinemas/cinemas.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cinema } from './entities/cinema.entity';
import { Room } from './entities/room.entity';
import { SeatType } from './entities/seat-type.entity';
import { Seat } from './entities/seat.entity';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { GenerateSeatsDto } from './dto/generate-seats.dto';
import { CreateSeatTypeDto } from './dto/create-seat-type.dto';

@Injectable()
export class CinemasService {
  constructor(
    @InjectRepository(Cinema)
    private readonly cinemasRepository: Repository<Cinema>,
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    @InjectRepository(SeatType)
    private readonly seatTypesRepository: Repository<SeatType>,
    @InjectRepository(Seat)
    private readonly seatsRepository: Repository<Seat>,
  ) {}

  async findAll(cityId?: number): Promise<Cinema[]> {
    const query = this.cinemasRepository
      .createQueryBuilder('cinema')
      .leftJoinAndSelect('cinema.city', 'city')
      .leftJoinAndSelect('cinema.rooms', 'room', 'room.isActive = true')
      .where('cinema.isActive = true');

    if (cityId) {
      query.andWhere('cinema.cityId = :cityId', { cityId });
    }

    return query.orderBy('cinema.name', 'ASC').getMany();
  }

  async findById(id: number): Promise<Cinema> {
    const cinema = await this.cinemasRepository.findOne({
      where: { id },
      relations: ['city', 'rooms'],
    });

    if (!cinema) {
      throw new NotFoundException(`Cine con ID ${id} no encontrado`);
    }

    return cinema;
  }

  async createCinema(dto: CreateCinemaDto): Promise<Cinema> {
    const cinema = this.cinemasRepository.create({
      name: dto.name,
      address: dto.address,
      cityId: dto.cityId || null,
      isActive: true,
    });

    return this.cinemasRepository.save(cinema);
  }

  async updateCinema(id: number, dto: UpdateCinemaDto): Promise<Cinema> {
    const cinema = await this.findById(id);

    if (dto.name !== undefined) cinema.name = dto.name;
    if (dto.address !== undefined) cinema.address = dto.address;
    if (dto.cityId !== undefined) cinema.cityId = dto.cityId;
    if (dto.isActive !== undefined) cinema.isActive = dto.isActive;

    return this.cinemasRepository.save(cinema);
  }

  async updateCinemaStatus(id: number, isActive: boolean): Promise<Cinema> {
    const cinema = await this.findById(id);
    cinema.isActive = isActive;
    return this.cinemasRepository.save(cinema);
  }

  async findRoomsByCinema(cinemaId: number): Promise<Room[]> {
    await this.findById(cinemaId);

    return this.roomsRepository.find({
      where: { cinemaId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findRoomById(roomId: number): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: ['cinema'],
    });

    if (!room) {
      throw new NotFoundException(`Sala con ID ${roomId} no encontrada`);
    }

    return room;
  }

  async createRoom(cinemaId: number, dto: CreateRoomDto): Promise<Room> {
    await this.findById(cinemaId);

    const room = this.roomsRepository.create({
      name: dto.name,
      format: dto.format,
      capacity: dto.capacity,
      cinemaId,
      isActive: true,
    });

    return this.roomsRepository.save(room);
  }

  async getRoomSeats(roomId: number): Promise<Seat[]> {
    await this.findRoomById(roomId);

    return this.seatsRepository.find({
      where: { roomId, isActive: true },
      relations: ['seatType'],
      order: { row: 'ASC', number: 'ASC' },
    });
  }

  async generateSeats(
    roomId: number,
    dto: GenerateSeatsDto,
  ): Promise<{ message: string; count: number }> {
    const room = await this.findRoomById(roomId);

    let seatTypeId = dto.seatTypeId;
    if (!seatTypeId) {
      const defaultType = await this.seatTypesRepository.findOne({
        where: { name: 'General' },
      });
      if (!defaultType) {
        const firstType = await this.seatTypesRepository.findOne({
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
    await this.seatsRepository.delete({ roomId });

    const seatsToInsert: Seat[] = [];
    for (let r = 0; r < dto.rows; r++) {
      const rowLetter = String.fromCharCode(65 + r); // A, B, C...
      for (let n = 1; n <= dto.seatsPerRow; n++) {
        const seat = this.seatsRepository.create({
          roomId,
          seatTypeId,
          row: rowLetter,
          number: n,
          isAvailable: true,
          isActive: true,
        });
        seatsToInsert.push(seat);
      }
    }

    await this.seatsRepository.save(seatsToInsert, { chunk: 100 });

    // Update room capacity
    room.capacity = seatsToInsert.length;
    await this.roomsRepository.save(room);

    return {
      message: `Se generaron ${seatsToInsert.length} asientos para la sala ${room.name}`,
      count: seatsToInsert.length,
    };
  }

  async getSeatTypes(): Promise<SeatType[]> {
    return this.seatTypesRepository.find({
      order: { id: 'ASC' },
    });
  }

  async createSeatType(dto: CreateSeatTypeDto): Promise<SeatType> {
    const seatType = this.seatTypesRepository.create({
      name: dto.name,
      description: dto.description || null,
      priceFactor: dto.priceFactor.toFixed(2),
    });

    return this.seatTypesRepository.save(seatType);
  }
}
