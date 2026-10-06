import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { Promotion } from '../entities/promotion.entity.js';

@Injectable()
export class PromotionDao extends BaseDao<Promotion> {
  constructor(
    @InjectRepository(Promotion)
    repository: Repository<Promotion>,
  ) {
    super(repository);
  }
}
