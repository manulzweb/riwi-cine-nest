import { BonusWallet } from '../entities/bonus-wallet.entity.js';
import { Membership } from '../entities/membership.entity.js';
import {
  WalletResponseDto,
  MembershipResponseDto,
} from '../dto/loyalty-response.dto.js';

export class LoyaltyMapper {
  static toWalletResponseDto(wallet: BonusWallet): WalletResponseDto {
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance,
      updatedAt: wallet.updatedAt,
    };
  }

  static toMembershipResponseDto(
    membership: Membership,
  ): MembershipResponseDto {
    return {
      id: membership.id,
      userId: membership.userId,
      code: membership.code,
      levelId: membership.levelId,
      statusId: membership.statusId,
      pointsBalance: membership.pointsBalance,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
      levelName: membership.level?.name,
      statusName: membership.status?.name,
    };
  }
}
