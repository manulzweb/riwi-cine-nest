// src/modules/showtimes/showtimes.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ShowtimesService } from './showtimes.service.js';
import { CinemaFunctionDao } from './dao/cinema-function.dao.js';
import { MovieDao } from '../movies/dao/movie.dao.js';
import { RoomDao } from '../cinemas/dao/room.dao.js';
import { SeatDao } from '../cinemas/dao/seat.dao.js';
import { CinemaFunction } from './entities/cinema-function.entity.js';

describe('ShowtimesService', () => {
  let service: ShowtimesService;

  const mockFunctionDao = {
    findWithFilters: jest.fn(),
    findForBillboard: jest.fn(),
    findByIdWithDetails: jest.fn(),
    findOverlapping: jest.fn(),
    save: jest.fn(),
  };

  const mockMovieDao = {
    findOne: jest.fn(),
  };

  const mockRoomDao = {
    findOne: jest.fn(),
  };

  const mockSeatDao = {
    findByRoomId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimesService,
        {
          provide: CinemaFunctionDao,
          useValue: mockFunctionDao,
        },
        {
          provide: MovieDao,
          useValue: mockMovieDao,
        },
        {
          provide: RoomDao,
          useValue: mockRoomDao,
        },
        {
          provide: SeatDao,
          useValue: mockSeatDao,
        },
      ],
    }).compile();

    service = module.get<ShowtimesService>(ShowtimesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const movie = { id: 1, title: 'Dune', duration: 120, isActive: true };
    const room = {
      id: 10,
      name: 'Sala 1',
      capacity: 100,
      format: 'IMAX',
      isActive: true,
    };

    it('should create a showtime successfully and auto-calculate endTime', async () => {
      mockMovieDao.findOne.mockResolvedValue(movie);
      mockRoomDao.findOne.mockResolvedValue(room);
      mockFunctionDao.findOverlapping.mockResolvedValue(null);

      const startTime = '2026-10-10T14:00:00.000Z';
      mockFunctionDao.save.mockImplementation((fn: any) =>
        Promise.resolve({ ...fn, id: 1 }),
      );

      const result = await service.create({
        movieId: 1,
        roomId: 10,
        startTime,
        price: 25000,
      });

      expect(result.id).toBe(1);
      expect(result.totalSeats).toBe(100);
      expect(result.availableSeats).toBe(100);
      expect(result.format).toBe('IMAX');
      // duration 120 + 20 = 140 minutes = 2h 20m -> 16:20
      const expectedEnd = new Date(
        new Date(startTime).getTime() + 140 * 60 * 1000,
      );
      expect(result.endTime.toISOString()).toBe(expectedEnd.toISOString());
    });

    it('should throw ConflictException if room already has overlapping showtime', async () => {
      mockMovieDao.findOne.mockResolvedValue(movie);
      mockRoomDao.findOne.mockResolvedValue(room);

      const conflictingFn = {
        id: 99,
        startTime: new Date('2026-10-10T13:30:00.000Z'),
        endTime: new Date('2026-10-10T15:30:00.000Z'),
      };
      mockFunctionDao.findOverlapping.mockResolvedValue(conflictingFn);

      await expect(
        service.create({
          movieId: 1,
          roomId: 10,
          startTime: '2026-10-10T14:00:00.000Z',
          price: 25000,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if movie does not exist', async () => {
      mockMovieDao.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          movieId: 999,
          roomId: 10,
          startTime: '2026-10-10T14:00:00.000Z',
          price: 25000,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBillboard', () => {
    it('should group showtimes by movie', async () => {
      const movie1 = {
        id: 1,
        title: 'Movie 1',
        synopsis: 'Syn',
        director: 'Dir',
        classification: 'PG',
        duration: 100,
        genres: ['Action'],
        formats: ['2D'],
        posterUrl: 'url',
        bannerUrl: null,
        trailerUrl: null,
      };

      const functions = [
        {
          id: 101,
          movie: movie1,
          startTime: new Date(),
          endTime: new Date(),
          price: 15000,
          format: '2D',
          availableSeats: 50,
          totalSeats: 50,
          roomRelation: {
            id: 1,
            name: 'Sala 1',
            capacity: 50,
            cinema: { id: 1, name: 'Cine 1', address: 'Dir 1' },
          },
        },
        {
          id: 102,
          movie: movie1,
          startTime: new Date(),
          endTime: new Date(),
          price: 15000,
          format: '2D',
          availableSeats: 50,
          totalSeats: 50,
          roomRelation: {
            id: 1,
            name: 'Sala 1',
            capacity: 50,
            cinema: { id: 1, name: 'Cine 1', address: 'Dir 1' },
          },
        },
      ];

      mockFunctionDao.findForBillboard.mockResolvedValue(functions);

      const billboard = await service.getBillboard({});
      expect(billboard).toHaveLength(1);
      expect(billboard[0].movie.title).toBe('Movie 1');
      expect(billboard[0].showtimes).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return showtime with room seats', async () => {
      const fn = {
        id: 1,
        roomId: 10,
        movie: { id: 1, title: 'Dune', duration: 120, posterUrl: '' },
        roomRelation: {
          id: 10,
          name: 'Sala 1',
          roomNumber: 1,
          cinemaId: 1,
          capacity: 50,
        },
      };
      mockFunctionDao.findByIdWithDetails.mockResolvedValue(fn);
      mockSeatDao.findByRoomId.mockResolvedValue([
        { id: 1, row: 'A', number: 1 },
      ]);

      const result = await service.findById(1);
      expect(result.id).toBe(1);
      expect(result.seats).toHaveLength(1);
    });

    it('should throw NotFoundException if showtime not found', async () => {
      mockFunctionDao.findByIdWithDetails.mockRejectedValue(
        new NotFoundException(),
      );
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
