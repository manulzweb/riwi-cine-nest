import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { ReservationSeat } from '../entities/reservation-seat.entity.js';
import { ReservationStatus } from '../entities/reservation.entity.js';

@Injectable()
export class ReservationSeatDao extends BaseDao<ReservationSeat> {
  constructor(
    @InjectRepository(ReservationSeat)
    repository: Repository<ReservationSeat>,
  ) {
    super(repository);
  }

  async findByReservationId(
    reservationId: number,
    manager?: EntityManager,
  ): Promise<ReservationSeat[]> {
    const repo = this.getRepo(manager);
    return repo.find({
      where: { reservationId },
      relations: ['seat', 'seat.seatType'],
    });
  }

  async findLockedOrSoldSeatIds(
    functionId: number,
    manager?: EntityManager,
  ): Promise<number[]> {
    const repo = this.getRepo(manager);
    const now = new Date();
    const rows = await repo
      .createQueryBuilder('rs')
      .innerJoin('rs.reservation', 'res')
      .where('res.functionId = :functionId', { functionId })
      .andWhere(
        '(res.status = :confirmedStatus OR (res.status = :activeStatus AND res.expiresAt > :now))',
        {
          confirmedStatus: ReservationStatus.CONFIRMED,
          activeStatus: ReservationStatus.ACTIVE,
          now,
        },
      )
      .select('rs.seatId', 'seatId')
      .getRawMany();

    return rows.map((r) => Number(r.seatId));
  }
}

