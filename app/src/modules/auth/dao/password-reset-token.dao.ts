import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { PasswordResetToken } from '../entities/password-reset-token.entity.js';

@Injectable()
export class PasswordResetTokenDao extends BaseDao<PasswordResetToken> {
  constructor(
    @InjectRepository(PasswordResetToken)
    repository: Repository<PasswordResetToken>,
  ) {
    super(repository);
  }

  async findByToken(
    token: string,
    manager?: EntityManager,
  ): Promise<PasswordResetToken | null> {
    const repo = this.getRepo(manager);
    return repo.findOne({
      where: { tokenHash: token },
      relations: ['user'],
    });
  }
}
