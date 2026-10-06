export class CinemaResponseDto {
  id: number;
  name: string;
  address: string;
  cityId: number | null;
  isActive: boolean;
  city?: { id: number; name: string };
  rooms?: { id: number; name: string; capacity: number; format?: string }[];
}
