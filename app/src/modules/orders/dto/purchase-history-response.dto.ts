export class PurchaseHistoryResponseDto {
  id: number;
  userId: number | null;
  totalPurchases: number;
  totalSpent: number;
  lastPurchaseAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
