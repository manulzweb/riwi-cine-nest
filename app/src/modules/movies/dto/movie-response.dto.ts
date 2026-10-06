export class MovieResponseDto {
  id: number;
  title: string;
  synopsis: string;
  director: string;
  actors: string[];
  genres: string[];
  languages: string[];
  formats: string[];
  duration: number;
  classification: string;
  releaseDate: string;
  posterUrl: string;
  bannerUrl: string | null;
  trailerUrl: string | null;
  averageRating: string;
  active: boolean;
  isActive: boolean;
  genre: string | null;
  language: string | null;
  isSubtitled: boolean | null;
  rating: number | null;
  createdAt: Date;
  updatedAt: Date;
}
