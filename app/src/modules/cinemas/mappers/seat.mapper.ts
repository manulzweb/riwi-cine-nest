import { Seat } from '../entities/seat.entity.js';
import { SeatResponseDto } from '../dto/seat-response.dto.js';

export class SeatMapper {
  static toResponseDto(entity: Seat): SeatResponseDto {
    return {
      id: entity.id,
      roomId: entity.roomId,
      seatTypeId: entity.seatTypeId,
      row: entity.row,
      number: entity.number,
      seatNumber: `${entity.row}${entity.number}`,
      isAvailable: entity.isAvailable,
      isActive: entity.isActive,
      seatType: entity.seatType
        ? {
            id: entity.seatType.id,
            name: entity.seatType.name,
            priceFactor: Number(entity.seatType.priceFactor),
            priceModifier: Number(entity.seatType.priceFactor),
          }
        : undefined,
    };
  }

  static toResponseDtoList(entities: Seat[]): SeatResponseDto[] {
    return entities.map((s) => this.toResponseDto(s));
  }
}
