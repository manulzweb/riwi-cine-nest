import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { NotificationPreference } from '../entities/notification-preference.entity.js';

@Injectable()
export class NotificationPreferenceDao extends BaseDao<NotificationPreference> {
  constructor(
    @InjectRepository(NotificationPreference)
    repository: Repository<NotificationPreference>,
  ) {
    super(repository);
  }

  async findByUserId(
    userId: number,
    manager?: EntityManager,
  ): Promise<NotificationPreference | null> {
    const repo = this.getRepo(manager);
    return repo.findOne({
      where: { userId },
      relations: ['user'],
    });
  }
}
