import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { BonusWallet } from '../entities/bonus-wallet.entity.js';

@Injectable()
export class BonusWalletDao extends BaseDao<BonusWallet> {
  constructor(
    @InjectRepository(BonusWallet)
    repository: Repository<BonusWallet>,
  ) {
    super(repository);
  }
}
