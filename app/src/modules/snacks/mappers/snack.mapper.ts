import { Snack } from '../entities/snack.entity.js';
import { Promotion } from '../entities/promotion.entity.js';
import {
  SnackResponseDto,
  PromotionResponseDto,
} from '../dto/snack-response.dto.js';

export class SnackMapper {
  static toPromotionResponseDto(entity: Promotion): PromotionResponseDto {
    return {
      id: entity.id,
      snackId: entity.snackId,
      name: entity.name,
      discountType: entity.discountType,
      discountValue: Number(entity.discountValue),
      startDate: entity.startDate,
      endDate: entity.endDate,
      isActive: entity.isActive,
    };
  }

  static toResponseDto(entity: Snack): SnackResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: Number(entity.price),
      category: entity.category,
      stock: entity.stock,
      imageUrl: entity.imageUrl,
      discountPercentage: Number(entity.discountPercentage),
      promotions: entity.promotions?.map((p) => this.toPromotionResponseDto(p)),
    };
  }

  static toResponseDtoList(entities: Snack[]): SnackResponseDto[] {
    return entities.map((e) => this.toResponseDto(e));
  }
}
