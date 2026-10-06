import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { Profile } from '../entities/profile.entity.js';

@Injectable()
export class ProfileDao extends BaseDao<Profile> {
  constructor(
    @InjectRepository(Profile)
    repository: Repository<Profile>,
  ) {
    super(repository);
  }

  async findByUserId(
    userId: number,
    manager?: EntityManager,
  ): Promise<Profile | null> {
    const repo = this.getRepo(manager);
    return repo.findOne({
      where: { userId },
      relations: ['city', 'favoriteCinema'],
    });
  }
}
