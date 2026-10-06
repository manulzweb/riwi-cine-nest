import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { Membership } from '../entities/membership.entity.js';

@Injectable()
export class MembershipDao extends BaseDao<Membership> {
  constructor(
    @InjectRepository(Membership)
    repository: Repository<Membership>,
  ) {
    super(repository);
  }
}
