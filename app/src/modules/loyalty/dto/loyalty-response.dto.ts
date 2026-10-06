export class WalletResponseDto {
  id: number;
  userId: number | null;
  balance: number;
  updatedAt: Date;
}

export class MembershipResponseDto {
  id: number;
  userId: number;
  code: string;
  levelId: number;
  statusId: number;
  pointsBalance: number;
  createdAt: Date;
  updatedAt: Date;
  levelName?: string;
  statusName?: string;
}
