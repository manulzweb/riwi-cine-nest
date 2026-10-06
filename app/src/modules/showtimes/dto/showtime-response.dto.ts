export class ShowtimeResponseDto {
  id: number;
  movieId: number;
  roomId: number | null;
  startTime: Date | null;
  endTime: Date | null;
  price: number;
  format: string | null;
  isActive: boolean;
  movie?: {
    id: number;
    title: string;
    duration: number;
    posterUrl: string | null;
  };
  room?: {
    id: number;
    name: string;
    cinemaId: number;
  };
  cinema?: {
    id: number;
    name: string;
    address: string;
  };
}
