import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { Seat } from '../entities/seat.entity.js';

@Injectable()
export class SeatDao extends BaseDao<Seat> {
  constructor(
    @InjectRepository(Seat)
    repository: Repository<Seat>,
  ) {
    super(repository);
  }

  async findByRoomId(roomId: number, manager?: EntityManager): Promise<Seat[]> {
    const repo = this.getRepo(manager);
    return repo.find({
      where: { roomId, isActive: true },
      relations: ['seatType'],
      order: { row: 'ASC', number: 'ASC' },
    });
  }

  async countByRoomId(
    roomId: number,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = this.getRepo(manager);
    return repo.count({ where: { roomId } });
  }

  async deleteByRoomId(roomId: number, manager?: EntityManager): Promise<void> {
    const repo = this.getRepo(manager);
    await repo.delete({ roomId });
  }
}
