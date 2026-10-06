import { PurchaseHistory } from '../entities/purchase-history.entity.js';
import { PurchaseHistoryResponseDto } from '../dto/purchase-history-response.dto.js';

export class PurchaseHistoryMapper {
  static toResponseDto(entity: PurchaseHistory): PurchaseHistoryResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      totalPurchases: entity.totalPurchases,
      totalSpent: Number(entity.totalSpent),
      lastPurchaseAt: entity.lastPurchaseAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseDtoList(
    entities: PurchaseHistory[],
  ): PurchaseHistoryResponseDto[] {
    return entities.map((e) => this.toResponseDto(e));
  }
}
