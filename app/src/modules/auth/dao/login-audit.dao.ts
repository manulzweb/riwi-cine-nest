import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { LoginAudit } from '../entities/login-audit.entity.js';

@Injectable()
export class LoginAuditDao extends BaseDao<LoginAudit> {
  constructor(
    @InjectRepository(LoginAudit)
    repository: Repository<LoginAudit>,
  ) {
    super(repository);
  }
}
