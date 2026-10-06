import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { Movie } from '../entities/movie.entity.js';
import { MovieQueryDto } from '../dto/movie-query.dto.js';

@Injectable()
export class MovieDao extends BaseDao<Movie> {
  constructor(
    @InjectRepository(Movie)
    repository: Repository<Movie>,
  ) {
    super(repository);
  }

  async findPaginated(
    query: MovieQueryDto,
    manager?: EntityManager,
  ): Promise<[Movie[], number, number, number]> {
    const repo = this.getRepo(manager);
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const qb = repo.createQueryBuilder('movie').where('movie.isActive = true');

    if (query.search) {
      qb.andWhere(
        '(LOWER(movie.title) LIKE :search OR LOWER(movie.director) LIKE :search OR LOWER(movie.synopsis) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    if (query.genre) {
      qb.andWhere(
        '(LOWER(movie.genre) = :genre OR :genreRaw = ANY(movie.genres))',
        { genre: query.genre.toLowerCase(), genreRaw: query.genre },
      );
    }

    if (query.format) {
      qb.andWhere(':format = ANY(movie.formats)', { format: query.format });
    }

    qb.orderBy('movie.releaseDate', 'DESC')
      .addOrderBy('movie.title', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return [data, total, page, limit];
  }

  async findPremieres(limit = 10, manager?: EntityManager): Promise<Movie[]> {
    const repo = this.getRepo(manager);
    return repo
      .createQueryBuilder('movie')
      .where('movie.isActive = true')
      .andWhere("movie.releaseDate >= CURRENT_DATE - INTERVAL '60 days'")
      .orderBy('movie.releaseDate', 'DESC')
      .take(limit)
      .getMany();
  }

  async findByIdWithFunctions(
    id: number,
    manager?: EntityManager,
  ): Promise<Movie> {
    const repo = this.getRepo(manager);
    const movie = await repo.findOne({
      where: { id },
      relations: ['functions'],
    });

    if (!movie) {
      throw new NotFoundException(`Película con ID ${id} no encontrada`);
    }

    return movie;
  }
}
