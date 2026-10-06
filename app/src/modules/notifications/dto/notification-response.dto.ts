export class NotificationPreferenceResponseDto {
  id: number;
  userId: number | null;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  updatedAt: Date;
}

export class UpcomingMovieNotificationResponseDto {
  id: number;
  userId: number | null;
  movieId: number | null;
  notifiedAt: Date | null;
  createdAt: Date;
  movieTitle?: string;
}
