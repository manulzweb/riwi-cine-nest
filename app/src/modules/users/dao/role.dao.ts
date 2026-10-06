import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { Role } from '../entities/role.entity.js';

@Injectable()
export class RoleDao extends BaseDao<Role> {
  constructor(
    @InjectRepository(Role)
    repository: Repository<Role>,
  ) {
    super(repository);
  }

  async findByName(
    name: string,
    manager?: EntityManager,
  ): Promise<Role | null> {
    const repo = this.getRepo(manager);
    return repo.findOne({ where: { name } });
  }
}
