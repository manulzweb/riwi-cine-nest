import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { Reservation } from '../entities/reservation.entity.js';

@Injectable()
export class ReservationDao extends BaseDao<Reservation> {
  constructor(
    @InjectRepository(Reservation)
    repository: Repository<Reservation>,
  ) {
    super(repository);
  }

  async findByUserId(
    userId: number,
    manager?: EntityManager,
  ): Promise<Reservation[]> {
    const repo = this.getRepo(manager);
    return repo.find({
      where: { userId },
      relations: ['seats', 'seats.seat', 'function', 'function.movie'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdWithDetails(
    id: number,
    manager?: EntityManager,
  ): Promise<Reservation | null> {
    const repo = this.getRepo(manager);
    return repo.findOne({
      where: { id },
      relations: ['seats', 'seats.seat', 'function', 'function.movie', 'user'],
    });
  }
}
