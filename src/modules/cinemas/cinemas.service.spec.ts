// src/modules/cinemas/cinemas.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CinemasService } from './cinemas.service';
import { Cinema } from './entities/cinema.entity';
import { Room } from './entities/room.entity';
import { SeatType } from './entities/seat-type.entity';
import { Seat } from './entities/seat.entity';

describe('CinemasService', () => {
  let service: CinemasService;

  const mockCinemasRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRoomsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSeatTypesRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSeatsRepository = {
    find: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CinemasService,
        {
          provide: getRepositoryToken(Cinema),
          useValue: mockCinemasRepository,
        },
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomsRepository,
        },
        {
          provide: getRepositoryToken(SeatType),
          useValue: mockSeatTypesRepository,
        },
        {
          provide: getRepositoryToken(Seat),
          useValue: mockSeatsRepository,
        },
      ],
    }).compile();

    service = module.get<CinemasService>(CinemasService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all active cinemas', async () => {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 1, name: 'Cinema Test' }]),
      };
      mockCinemasRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Cinema Test');
    });

    it('should filter by cityId when provided', async () => {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 1, cityId: 5 }]),
      };
      mockCinemasRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll(5);
      expect(qb.andWhere).toHaveBeenCalledWith('cinema.cityId = :cityId', {
        cityId: 5,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return cinema if found', async () => {
      mockCinemasRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Cinema 1',
      });
      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if cinema does not exist', async () => {
      mockCinemasRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCinema', () => {
    it('should create and return cinema', async () => {
      const dto = { name: 'New Cinema', address: 'Calle 123', cityId: 1 };
      mockCinemasRepository.create.mockReturnValue({
        ...dto,
        id: 1,
        isActive: true,
      });
      mockCinemasRepository.save.mockResolvedValue({
        ...dto,
        id: 1,
        isActive: true,
      });

      const result = await service.createCinema(dto);
      expect(result.id).toBe(1);
      expect(mockCinemasRepository.save).toHaveBeenCalled();
    });
  });

  describe('createRoom', () => {
    it('should create and return room', async () => {
      mockCinemasRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Cinema 1',
      });
      const dto = { name: 'Sala 1', format: 'IMAX', capacity: 100 };
      mockRoomsRepository.create.mockReturnValue({
        ...dto,
        id: 1,
        cinemaId: 1,
        isActive: true,
      });
      mockRoomsRepository.save.mockResolvedValue({
        ...dto,
        id: 1,
        cinemaId: 1,
        isActive: true,
      });

      const result = await service.createRoom(1, dto);
      expect(result.id).toBe(1);
      expect(result.cinemaId).toBe(1);
    });
  });

  describe('generateSeats', () => {
    it('should generate rows and seats for a room', async () => {
      mockRoomsRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Sala 1',
        capacity: 20,
      });
      mockSeatTypesRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'General',
      });
      mockSeatsRepository.delete.mockResolvedValue({ affected: 0 });
      mockSeatsRepository.create.mockImplementation((s) => s);
      mockSeatsRepository.save.mockResolvedValue([]);
      mockRoomsRepository.save.mockResolvedValue({});

      const result = await service.generateSeats(1, {
        rows: 2,
        seatsPerRow: 5,
      });
      expect(result.count).toBe(10);
      expect(mockSeatsRepository.delete).toHaveBeenCalledWith({ roomId: 1 });
      expect(mockSeatsRepository.save).toHaveBeenCalled();
    });
  });

  describe('getSeatTypes', () => {
    it('should return seat types', async () => {
      mockSeatTypesRepository.find.mockResolvedValue([
        { id: 1, name: 'General' },
      ]);
      const result = await service.getSeatTypes();
      expect(result).toHaveLength(1);
    });
  });
});
