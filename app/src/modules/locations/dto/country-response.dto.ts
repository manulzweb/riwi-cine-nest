export class CountryResponseDto {
  id: number;
  name: string;
  isActive: boolean;
  departments?: { id: number; name: string }[];
}
