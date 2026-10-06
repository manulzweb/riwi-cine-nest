import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { Room } from '../entities/room.entity.js';

@Injectable()
export class RoomDao extends BaseDao<Room> {
  constructor(
    @InjectRepository(Room)
    repository: Repository<Room>,
  ) {
    super(repository);
  }

  async findByCinemaId(
    cinemaId: number,
    manager?: EntityManager,
  ): Promise<Room[]> {
    const repo = this.getRepo(manager);
    return repo.find({
      where: { cinemaId, isActive: true },
      order: { id: 'ASC' },
    });
  }

  async findByIdOrThrow(id: number, manager?: EntityManager): Promise<Room> {
    const room = await this.findById(id, manager);
    if (!room) {
      throw new NotFoundException(`Sala con ID ${id} no encontrada`);
    }
    return room;
  }
}
