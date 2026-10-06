import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { Snack } from '../entities/snack.entity.js';

@Injectable()
export class SnackDao extends BaseDao<Snack> {
  constructor(
    @InjectRepository(Snack)
    repository: Repository<Snack>,
  ) {
    super(repository);
  }
}
