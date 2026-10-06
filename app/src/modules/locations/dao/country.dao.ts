import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { Country } from '../entities/country.entity.js';

@Injectable()
export class CountryDao extends BaseDao<Country> {
  constructor(
    @InjectRepository(Country)
    repository: Repository<Country>,
  ) {
    super(repository);
  }

  async findCountries(
    onlyActive = true,
    manager?: EntityManager,
  ): Promise<Country[]> {
    const repo = this.getRepo(manager);
    const where = onlyActive ? { isActive: true } : {};
    return repo.find({
      where,
      relations: ['departments'],
      order: { name: 'ASC' },
    });
  }

  async findByIdOrThrow(id: number, manager?: EntityManager): Promise<Country> {
    const country = await this.findById(id, manager);
    if (!country) {
      throw new NotFoundException(`País con ID ${id} no encontrado`);
    }
    return country;
  }
}
