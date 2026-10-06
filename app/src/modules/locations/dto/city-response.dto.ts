export class CityResponseDto {
  id: number;
  name: string;
  departmentId: number | null;
  isActive: boolean;
  departmentName?: string;
  countryName?: string;
  cinemas?: { id: number; name: string }[];
}
