// src/modules/movies/movies.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service.js';
import { MovieDao } from './dao/movie.dao.js';
import { Movie } from './entities/movie.entity.js';

describe('MoviesService', () => {
  let service: MoviesService;

  const mockMovieDao = {
    findPaginated: jest.fn(),
    findPremieres: jest.fn(),
    findByIdWithFunctions: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: MovieDao,
          useValue: mockMovieDao,
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
      const mockMovie = new Movie();
      mockMovie.id = 1;
      mockMovie.title = 'Dune';
      mockMovie.isActive = true;
      mockMovie.active = true;

      mockMovieDao.findPaginated.mockResolvedValue([[mockMovie], 1, 1, 10]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        search: 'dune',
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(mockMovieDao.findPaginated).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return movie if found', async () => {
      const mockMovie = new Movie();
      mockMovie.id = 1;
      mockMovie.title = 'Dune';
      mockMovieDao.findByIdWithFunctions.mockResolvedValue(mockMovie);

      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockMovieDao.findByIdWithFunctions.mockRejectedValue(
        new NotFoundException(),
      );
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
      mockMovieDao.save.mockImplementation((m: Movie) => {
        m.id = 1;
        return Promise.resolve(m);
      });

      const result = await service.create(dto);
      expect(result.id).toBe(1);
      expect(result.title).toBe('New Movie');
      expect(result.isActive).toBe(true);
      expect(result.active).toBe(true);
    });
  });

  describe('update', () => {
    it('should update movie fields', async () => {
      const existing = new Movie();
      existing.id = 1;
      existing.title = 'Old Title';
      existing.isActive = true;
      existing.active = true;

      mockMovieDao.findByIdWithFunctions.mockResolvedValue(existing);
      mockMovieDao.save.mockImplementation((m: Movie) => Promise.resolve(m));

      const result = await service.update(1, { title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('delete', () => {
    it('should deactivate movie', async () => {
      const existing = new Movie();
      existing.id = 1;
      existing.title = 'Movie';
      existing.isActive = true;
      existing.active = true;

      mockMovieDao.findByIdWithFunctions.mockResolvedValue(existing);
      mockMovieDao.save.mockImplementation((m: Movie) => Promise.resolve(m));

      const result = await service.delete(1);
      expect(result.message).toContain('desactivada');
      expect(existing.isActive).toBe(false);
      expect(existing.active).toBe(false);
    });
  });
});
