// src/modules/loyalty/loyalty.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BonusWallet } from './entities/bonus-wallet.entity.js';
import { Membership } from './entities/membership.entity.js';
import { MembershipLevel } from './entities/membership-level.entity.js';
import { MembershipStatus } from './entities/membership-status.entity.js';
import { BonusWalletDao } from './dao/bonus-wallet.dao.js';
import { MembershipDao } from './dao/membership.dao.js';
import { MembershipLevelDao } from './dao/membership-level.dao.js';
import { MembershipStatusDao } from './dao/membership-status.dao.js';
import { LoyaltyMapper } from './mappers/loyalty.mapper.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BonusWallet,
      Membership,
      MembershipLevel,
      MembershipStatus,
    ]),
  ],
  providers: [
    BonusWalletDao,
    MembershipDao,
    MembershipLevelDao,
    MembershipStatusDao,
    LoyaltyMapper,
  ],
  exports: [
    BonusWalletDao,
    MembershipDao,
    MembershipLevelDao,
    MembershipStatusDao,
    LoyaltyMapper,
    TypeOrmModule,
  ],
})
export class LoyaltyModule {}
