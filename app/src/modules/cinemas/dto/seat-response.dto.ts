export class SeatTypeResponseDto {
  id: number;
  name: string;
  priceFactor: number;
  priceModifier?: number;
}

export class SeatResponseDto {
  id: number;
  roomId: number;
  seatTypeId: number;
  row: string;
  number: number;
  seatNumber: string;
  isAvailable: boolean;
  isActive: boolean;
  seatType?: SeatTypeResponseDto;
}
