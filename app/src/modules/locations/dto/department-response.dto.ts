export class DepartmentResponseDto {
  id: number;
  name: string;
  countryId: number | null;
  isActive: boolean;
  countryName?: string;
  cities?: { id: number; name: string }[];
}
