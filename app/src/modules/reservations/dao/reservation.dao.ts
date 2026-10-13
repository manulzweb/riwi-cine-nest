import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import {
  Reservation,
  ReservationStatus,
} from '../entities/reservation.entity.js';

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
      relations: [
        'seats',
        'seats.seat',
        'seats.seat.seatType',
        'function',
        'function.movie',
        'function.roomRelation',
        'function.roomRelation.cinema',
      ],
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
      relations: [
        'seats',
        'seats.seat',
        'seats.seat.seatType',
        'function',
        'function.movie',
        'function.roomRelation',
        'function.roomRelation.cinema',
        'user',
      ],
    });
  }

  async findActiveByFunctionId(
    functionId: number,
    manager?: EntityManager,
  ): Promise<Reservation[]> {
    const repo = this.getRepo(manager);
    const now = new Date();
    return repo
      .createQueryBuilder('res')
      .leftJoinAndSelect('res.seats', 'seats')
      .leftJoinAndSelect('seats.seat', 'seat')
      .where('res.functionId = :functionId', { functionId })
      .andWhere(
        '(res.status = :confirmedStatus OR (res.status = :activeStatus AND res.expiresAt > :now))',
        {
          confirmedStatus: ReservationStatus.CONFIRMED,
          activeStatus: ReservationStatus.ACTIVE,
          now,
        },
      )
      .getMany();
  }
}

