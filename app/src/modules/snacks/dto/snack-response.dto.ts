export class PromotionResponseDto {
  id: number;
  snackId: number | null;
  name: string;
  discountType: string;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export class SnackResponseDto {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock: number;
  imageUrl: string | null;
  discountPercentage: number;
  promotions?: PromotionResponseDto[];
}
