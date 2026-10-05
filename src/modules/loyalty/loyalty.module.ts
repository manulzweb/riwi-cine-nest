import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BonusWallet } from './entities/bonus-wallet.entity';
import { MembershipLevel } from './entities/membership-level.entity';
import { MembershipStatus } from './entities/membership-status.entity';
import { Membership } from './entities/membership.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BonusWallet,
      Membership,
      MembershipLevel,
      MembershipStatus,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class LoyaltyModule {}
