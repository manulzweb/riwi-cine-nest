import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { EmailVerificationToken } from '../entities/email-verification-token.entity.js';

@Injectable()
export class EmailVerificationTokenDao extends BaseDao<EmailVerificationToken> {
  constructor(
    @InjectRepository(EmailVerificationToken)
    repository: Repository<EmailVerificationToken>,
  ) {
    super(repository);
  }

  async findByToken(
    token: string,
    manager?: EntityManager,
  ): Promise<EmailVerificationToken | null> {
    const repo = this.getRepo(manager);
    return repo.findOne({
      where: { tokenHash: token },
      relations: ['user'],
    });
  }
}
