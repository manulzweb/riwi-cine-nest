// src/modules/showtimes/showtimes.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ShowtimesService } from './showtimes.service';
import { CinemaFunction } from './entities/cinema-function.entity';
import { Movie } from '../movies/entities/movie.entity';
import { Room } from '../cinemas/entities/room.entity';
import { Seat } from '../cinemas/entities/seat.entity';

describe('ShowtimesService', () => {
  let service: ShowtimesService;

  const mockFunctionsRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockMoviesRepository = {
    findOne: jest.fn(),
  };

  const mockRoomsRepository = {
    findOne: jest.fn(),
  };

  const mockSeatsRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimesService,
        {
          provide: getRepositoryToken(CinemaFunction),
          useValue: mockFunctionsRepository,
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMoviesRepository,
        },
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomsRepository,
        },
        {
          provide: getRepositoryToken(Seat),
          useValue: mockSeatsRepository,
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
      mockMoviesRepository.findOne.mockResolvedValue(movie);
      mockRoomsRepository.findOne.mockResolvedValue(room);

      // No overlap
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      mockFunctionsRepository.createQueryBuilder.mockReturnValue(qb);

      const startTime = '2026-10-10T14:00:00.000Z';
      mockFunctionsRepository.create.mockImplementation((fn) => ({
        ...fn,
        id: 1,
      }));
      mockFunctionsRepository.save.mockImplementation((fn) =>
        Promise.resolve(fn),
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
      mockMoviesRepository.findOne.mockResolvedValue(movie);
      mockRoomsRepository.findOne.mockResolvedValue(room);

      // Overlap detected!
      const conflictingFn = {
        id: 99,
        startTime: new Date('2026-10-10T13:30:00.000Z'),
        endTime: new Date('2026-10-10T15:30:00.000Z'),
      };
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(conflictingFn),
      };
      mockFunctionsRepository.createQueryBuilder.mockReturnValue(qb);

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
      mockMoviesRepository.findOne.mockResolvedValue(null);

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
            cinema: { id: 1, name: 'Cine 1', address: 'Dir 1' },
          },
        },
      ];

      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(functions),
      };
      mockFunctionsRepository.createQueryBuilder.mockReturnValue(qb);

      const billboard = await service.getBillboard({});
      expect(billboard).toHaveLength(1);
      expect(billboard[0].movie.title).toBe('Movie 1');
      expect(billboard[0].showtimes).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return showtime with room seats', async () => {
      const fn = { id: 1, roomId: 10, movie: { id: 1 } };
      mockFunctionsRepository.findOne.mockResolvedValue(fn);
      mockSeatsRepository.find.mockResolvedValue([
        { id: 1, row: 'A', number: 1 },
      ]);

      const result = await service.findById(1);
      expect(result.id).toBe(1);
      expect(result.seats).toHaveLength(1);
    });

    it('should throw NotFoundException if showtime not found', async () => {
      mockFunctionsRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
