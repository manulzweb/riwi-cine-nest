import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { MembershipLevel } from '../entities/membership-level.entity.js';

@Injectable()
export class MembershipLevelDao extends BaseDao<MembershipLevel> {
  constructor(
    @InjectRepository(MembershipLevel)
    repository: Repository<MembershipLevel>,
  ) {
    super(repository);
  }
}
