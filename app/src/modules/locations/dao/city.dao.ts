import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { City } from '../entities/city.entity.js';

@Injectable()
export class CityDao extends BaseDao<City> {
  constructor(
    @InjectRepository(City)
    repository: Repository<City>,
  ) {
    super(repository);
  }

  async findCities(
    departmentId?: number,
    manager?: EntityManager,
  ): Promise<City[]> {
    const repo = this.getRepo(manager);
    const where: FindOptionsWhere<City> = { isActive: true };
    if (departmentId) where.departmentId = departmentId;
    return repo.find({
      where,
      relations: ['department'],
      order: { name: 'ASC' },
    });
  }

  async findCityById(id: number, manager?: EntityManager): Promise<City> {
    const repo = this.getRepo(manager);
    const city = await repo.findOne({
      where: { id },
      relations: ['department', 'department.country', 'cinemas'],
    });
    if (!city) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'RESOURCE_NOT_FOUND',
        message: 'Ciudad no encontrada',
      });
    }
    return city;
  }
}
