import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { User } from '../entities/user.entity.js';

@Injectable()
export class UserDao extends BaseDao<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository);
  }

  async findByEmail(
    email: string,
    manager?: EntityManager,
  ): Promise<User | null> {
    const repo = this.getRepo(manager);
    return repo.findOne({
      where: { email },
      relations: ['role', 'profile'],
    });
  }

  async findByIdWithRelations(
    id: number,
    manager?: EntityManager,
  ): Promise<User | null> {
    const repo = this.getRepo(manager);
    return repo.findOne({
      where: { id },
      relations: ['role', 'profile'],
    });
  }

  async findPaginated(
    page = 1,
    limit = 10,
    manager?: EntityManager,
  ): Promise<[User[], number]> {
    return this.findAndCount(
      {
        relations: ['role', 'profile'],
        skip: (page - 1) * limit,
        take: limit,
        order: { id: 'DESC' },
      },
      manager,
    );
  }
}
