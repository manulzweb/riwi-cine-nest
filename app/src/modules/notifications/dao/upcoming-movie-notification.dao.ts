import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { UpcomingMovieNotification } from '../entities/upcoming-movie-notification.entity.js';

@Injectable()
export class UpcomingMovieNotificationDao extends BaseDao<UpcomingMovieNotification> {
  constructor(
    @InjectRepository(UpcomingMovieNotification)
    repository: Repository<UpcomingMovieNotification>,
  ) {
    super(repository);
  }

  async findByUserId(
    userId: number,
    manager?: EntityManager,
  ): Promise<UpcomingMovieNotification[]> {
    const repo = this.getRepo(manager);
    return repo.find({
      where: { userId },
      relations: ['movie'],
      order: { createdAt: 'DESC' },
    });
  }
}
