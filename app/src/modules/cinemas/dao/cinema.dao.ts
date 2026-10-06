import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { Cinema } from '../entities/cinema.entity.js';

@Injectable()
export class CinemaDao extends BaseDao<Cinema> {
  constructor(
    @InjectRepository(Cinema)
    repository: Repository<Cinema>,
  ) {
    super(repository);
  }

  async findAllActive(
    cityId?: number,
    manager?: EntityManager,
  ): Promise<Cinema[]> {
    const repo = this.getRepo(manager);
    const query = repo
      .createQueryBuilder('cinema')
      .leftJoinAndSelect('cinema.city', 'city')
      .leftJoinAndSelect('cinema.rooms', 'room', 'room.isActive = true')
      .where('cinema.isActive = true');

    if (cityId) {
      query.andWhere('cinema.cityId = :cityId', { cityId });
    }

    return query.orderBy('cinema.name', 'ASC').getMany();
  }

  async findByIdWithRelations(
    id: number,
    manager?: EntityManager,
  ): Promise<Cinema> {
    const repo = this.getRepo(manager);
    const cinema = await repo.findOne({
      where: { id },
      relations: ['city', 'rooms'],
    });

    if (!cinema) {
      throw new NotFoundException(`Cine con ID ${id} no encontrado`);
    }

    return cinema;
  }
}
