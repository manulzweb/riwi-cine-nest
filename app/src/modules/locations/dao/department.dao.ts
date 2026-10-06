import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { Department } from '../entities/department.entity.js';

@Injectable()
export class DepartmentDao extends BaseDao<Department> {
  constructor(
    @InjectRepository(Department)
    repository: Repository<Department>,
  ) {
    super(repository);
  }

  async findDepartments(
    countryId?: number,
    manager?: EntityManager,
  ): Promise<Department[]> {
    const repo = this.getRepo(manager);
    const where: FindOptionsWhere<Department> = { isActive: true };
    if (countryId) where.countryId = countryId;
    return repo.find({
      where,
      relations: ['country', 'cities'],
      order: { name: 'ASC' },
    });
  }

  async findByIdOrThrow(
    id: number,
    manager?: EntityManager,
  ): Promise<Department> {
    const dept = await this.findById(id, manager);
    if (!dept) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
    return dept;
  }
}
