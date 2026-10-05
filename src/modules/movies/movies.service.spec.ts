// src/modules/movies/movies.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';

describe('MoviesService', () => {
  let service: MoviesService;

  const mockMoviesRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMoviesRepository,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated movies with meta', async () => {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([[{ id: 1, title: 'Dune' }], 1]),
      };
      mockMoviesRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        search: 'dune',
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(qb.andWhere).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return movie if found', async () => {
      mockMoviesRepository.findOne.mockResolvedValue({ id: 1, title: 'Dune' });
      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockMoviesRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and save a movie', async () => {
      const dto = {
        title: 'New Movie',
        synopsis: 'Great synopsis here',
        director: 'Director X',
        duration: 120,
        classification: 'PG-13',
        releaseDate: '2025-01-01',
        posterUrl: 'https://image.com/poster.jpg',
      };
      mockMoviesRepository.create.mockImplementation((m) => ({ ...m, id: 1 }));
      mockMoviesRepository.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.create(dto);
      expect(result.id).toBe(1);
      expect(result.title).toBe('New Movie');
      expect(result.isActive).toBe(true);
      expect(result.active).toBe(true);
    });
  });

  describe('update', () => {
    it('should update movie fields', async () => {
      const existing = {
        id: 1,
        title: 'Old Title',
        isActive: true,
        active: true,
      };
      mockMoviesRepository.findOne.mockResolvedValue(existing);
      mockMoviesRepository.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.update(1, { title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('delete', () => {
    it('should deactivate movie', async () => {
      const existing = { id: 1, title: 'Movie', isActive: true, active: true };
      mockMoviesRepository.findOne.mockResolvedValue(existing);
      mockMoviesRepository.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.delete(1);
      expect(result.message).toContain('desactivada');
      expect(existing.isActive).toBe(false);
      expect(existing.active).toBe(false);
    });
  });
});
