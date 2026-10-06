import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { CinemaFunction } from '../entities/cinema-function.entity.js';
import { ShowtimeQueryDto } from '../dto/showtime-query.dto.js';
import { BillboardQueryDto } from '../dto/billboard-query.dto.js';

@Injectable()
export class CinemaFunctionDao extends BaseDao<CinemaFunction> {
  constructor(
    @InjectRepository(CinemaFunction)
    repository: Repository<CinemaFunction>,
  ) {
    super(repository);
  }

  async findWithFilters(
    query: ShowtimeQueryDto,
    manager?: EntityManager,
  ): Promise<CinemaFunction[]> {
    const repo = this.getRepo(manager);
    const qb = repo
      .createQueryBuilder('fn')
      .leftJoinAndSelect('fn.movie', 'movie')
      .leftJoinAndSelect('fn.roomRelation', 'room')
      .leftJoinAndSelect('room.cinema', 'cinema')
      .where('fn.isActive = true');

    if (query.movieId) {
      qb.andWhere('fn.movieId = :movieId', { movieId: query.movieId });
    }

    if (query.roomId) {
      qb.andWhere('fn.roomId = :roomId', { roomId: query.roomId });
    }

    if (query.cinemaId) {
      qb.andWhere('room.cinemaId = :cinemaId', { cinemaId: query.cinemaId });
    }

    if (query.cityId) {
      qb.andWhere('cinema.cityId = :cityId', { cityId: query.cityId });
    }

    if (query.format) {
      qb.andWhere('fn.format = :format', { format: query.format });
    }

    if (query.date) {
      const startOfDay = new Date(`${query.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${query.date}T23:59:59.999Z`);
      qb.andWhere('fn.startTime BETWEEN :startOfDay AND :endOfDay', {
        startOfDay,
        endOfDay,
      });
    }

    return qb.orderBy('fn.startTime', 'ASC').getMany();
  }

  async findForBillboard(
    query: BillboardQueryDto,
    manager?: EntityManager,
  ): Promise<CinemaFunction[]> {
    const repo = this.getRepo(manager);
    const qb = repo
      .createQueryBuilder('fn')
      .leftJoinAndSelect('fn.movie', 'movie')
      .leftJoinAndSelect('fn.roomRelation', 'room')
      .leftJoinAndSelect('room.cinema', 'cinema')
      .where('fn.isActive = true')
      .andWhere('movie.isActive = true');

    if (query.cinemaId) {
      qb.andWhere('room.cinemaId = :cinemaId', { cinemaId: query.cinemaId });
    }

    if (query.cityId) {
      qb.andWhere('cinema.cityId = :cityId', { cityId: query.cityId });
    }

    if (query.movieId) {
      qb.andWhere('fn.movieId = :movieId', { movieId: query.movieId });
    }

    if (query.date) {
      const startOfDay = new Date(`${query.date}T00:00:00.000Z`);
      const endOfDay = new Date(`${query.date}T23:59:59.999Z`);
      qb.andWhere('fn.startTime BETWEEN :startOfDay AND :endOfDay', {
        startOfDay,
        endOfDay,
      });
    } else {
      qb.andWhere('fn.startTime >= NOW()');
    }

    return qb
      .orderBy('movie.title', 'ASC')
      .addOrderBy('fn.startTime', 'ASC')
      .getMany();
  }

  async findByIdWithDetails(
    id: number,
    manager?: EntityManager,
  ): Promise<CinemaFunction> {
    const repo = this.getRepo(manager);
    const showtime = await repo.findOne({
      where: { id },
      relations: ['movie', 'roomRelation', 'roomRelation.cinema'],
    });

    if (!showtime) {
      throw new NotFoundException(`Función con ID ${id} no encontrada`);
    }

    return showtime;
  }

  async findOverlapping(
    roomId: number,
    startTime: Date,
    endTime: Date,
    excludeId?: number,
    manager?: EntityManager,
  ): Promise<CinemaFunction | null> {
    const repo = this.getRepo(manager);
    const qb = repo
      .createQueryBuilder('fn')
      .where('fn.roomId = :roomId', { roomId })
      .andWhere('fn.isActive = true')
      .andWhere(
        '((fn.startTime <= :start AND fn.endTime > :start) OR (fn.startTime < :end AND fn.endTime >= :end) OR (fn.startTime >= :start AND fn.endTime <= :end))',
        { start: startTime, end: endTime },
      );

    if (excludeId) {
      qb.andWhere('fn.id != :excludeId', { excludeId });
    }

    return qb.getOne();
  }
}
