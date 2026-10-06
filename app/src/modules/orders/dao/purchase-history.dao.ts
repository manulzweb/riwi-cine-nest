import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { PurchaseHistory } from '../entities/purchase-history.entity.js';

@Injectable()
export class PurchaseHistoryDao extends BaseDao<PurchaseHistory> {
  constructor(
    @InjectRepository(PurchaseHistory)
    repository: Repository<PurchaseHistory>,
  ) {
    super(repository);
  }

  async findByUserId(
    userId: number,
    manager?: EntityManager,
  ): Promise<PurchaseHistory | null> {
    const repo = this.getRepo(manager);
    return repo.findOne({
      where: { userId },
      relations: ['user'],
    });
  }
}
