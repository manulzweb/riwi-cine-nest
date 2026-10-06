import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { ReservationSeat } from '../entities/reservation-seat.entity.js';

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
      relations: ['seat'],
    });
  }
}
