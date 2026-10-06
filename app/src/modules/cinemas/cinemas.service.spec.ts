// src/modules/cinemas/cinemas.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CinemasService } from './cinemas.service.js';
import { CinemaDao } from './dao/cinema.dao.js';
import { RoomDao } from './dao/room.dao.js';
import { SeatTypeDao } from './dao/seat-type.dao.js';
import { SeatDao } from './dao/seat.dao.js';

describe('CinemasService', () => {
  let service: CinemasService;

  const mockCinemaDao = {
    findAllActive: jest.fn(),
    findByIdWithRelations: jest.fn(),
    save: jest.fn(),
  };

  const mockRoomDao = {
    findByCinemaId: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockSeatTypeDao = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockSeatDao = {
    findByRoomId: jest.fn(),
    deleteByRoomId: jest.fn(),
    saveMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CinemasService,
        {
          provide: CinemaDao,
          useValue: mockCinemaDao,
        },
        {
          provide: RoomDao,
          useValue: mockRoomDao,
        },
        {
          provide: SeatTypeDao,
          useValue: mockSeatTypeDao,
        },
        {
          provide: SeatDao,
          useValue: mockSeatDao,
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
      mockCinemaDao.findAllActive.mockResolvedValue([
        { id: 1, name: 'Cinema Test', isActive: true },
      ]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Cinema Test');
    });

    it('should filter by cityId when provided', async () => {
      mockCinemaDao.findAllActive.mockResolvedValue([
        { id: 1, cityId: 5, isActive: true },
      ]);
      const result = await service.findAll(5);
      expect(mockCinemaDao.findAllActive).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return cinema if found', async () => {
      mockCinemaDao.findByIdWithRelations.mockResolvedValue({
        id: 1,
        name: 'Cinema 1',
        isActive: true,
      });
      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if cinema does not exist', async () => {
      mockCinemaDao.findByIdWithRelations.mockRejectedValue(
        new NotFoundException(),
      );
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCinema', () => {
    it('should create and return cinema', async () => {
      const dto = { name: 'New Cinema', address: 'Calle 123', cityId: 1 };
      mockCinemaDao.save.mockResolvedValue({
        ...dto,
        id: 1,
        isActive: true,
      });

      const result = await service.createCinema(dto);
      expect(result.id).toBe(1);
      expect(mockCinemaDao.save).toHaveBeenCalled();
    });
  });

  describe('createRoom', () => {
    it('should create and return room', async () => {
      mockCinemaDao.findByIdWithRelations.mockResolvedValue({
        id: 1,
        name: 'Cinema 1',
      });
      const dto = { name: 'Sala 1', roomNumber: 1, capacity: 100 };
      mockRoomDao.save.mockResolvedValue({
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
      mockRoomDao.findOne.mockResolvedValue({
        id: 1,
        name: 'Sala 1',
        capacity: 20,
      });
      mockSeatTypeDao.findOne.mockResolvedValue({
        id: 1,
        name: 'General',
      });
      mockSeatDao.deleteByRoomId.mockResolvedValue(undefined);
      mockSeatDao.saveMany.mockResolvedValue([]);
      mockRoomDao.save.mockResolvedValue({});

      const result = await service.generateSeats(1, {
        rows: 2,
        seatsPerRow: 5,
      });
      expect(result.count).toBe(10);
      expect(mockSeatDao.deleteByRoomId).toHaveBeenCalledWith(1);
      expect(mockSeatDao.saveMany).toHaveBeenCalled();
    });
  });

  describe('getSeatTypes', () => {
    it('should return seat types', async () => {
      mockSeatTypeDao.findAll.mockResolvedValue([
        { id: 1, name: 'General', priceModifier: 1.0 },
      ]);
      const result = await service.getSeatTypes();
      expect(result).toHaveLength(1);
    });
  });
});
