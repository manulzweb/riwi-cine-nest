import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { RefreshToken } from '../entities/refresh-token.entity.js';

@Injectable()
export class RefreshTokenDao extends BaseDao<RefreshToken> {
  constructor(
    @InjectRepository(RefreshToken)
    repository: Repository<RefreshToken>,
  ) {
    super(repository);
  }

  async findByToken(
    token: string,
    manager?: EntityManager,
  ): Promise<RefreshToken | null> {
    const repo = this.getRepo(manager);
    return repo.findOne({
      where: { tokenHash: token },
      relations: ['user', 'user.role'],
    });
  }

  async revokeAllUserTokens(
    userId: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);
    await repo.update({ userId, isRevoked: false }, { isRevoked: true });
  }
}
