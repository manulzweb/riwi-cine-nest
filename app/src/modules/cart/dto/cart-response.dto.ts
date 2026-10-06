export class CartResponseDto {
  id: number;
  userId: number | null;
  status: string;
  expiresAt: Date | null;
  items?: any[];
  tickets?: any[];
}
