import { Cart } from '../entities/cart.entity.js';
import { CartResponseDto } from '../dto/cart-response.dto.js';

export class CartMapper {
  static toResponseDto(entity: Cart): CartResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      status: entity.status,
      expiresAt: entity.expiresAt,
      items: entity.items,
      tickets: entity.tickets,
    };
  }
}
