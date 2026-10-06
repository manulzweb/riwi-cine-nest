import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { SeatType } from '../entities/seat-type.entity.js';

@Injectable()
export class SeatTypeDao extends BaseDao<SeatType> {
  constructor(
    @InjectRepository(SeatType)
    repository: Repository<SeatType>,
  ) {
    super(repository);
  }
}
