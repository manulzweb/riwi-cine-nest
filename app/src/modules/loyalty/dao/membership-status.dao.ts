import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { MembershipStatus } from '../entities/membership-status.entity.js';

@Injectable()
export class MembershipStatusDao extends BaseDao<MembershipStatus> {
  constructor(
    @InjectRepository(MembershipStatus)
    repository: Repository<MembershipStatus>,
  ) {
    super(repository);
  }
}
