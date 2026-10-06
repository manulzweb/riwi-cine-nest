import { NotificationPreference } from '../entities/notification-preference.entity.js';
import { UpcomingMovieNotification } from '../entities/upcoming-movie-notification.entity.js';
import {
  NotificationPreferenceResponseDto,
  UpcomingMovieNotificationResponseDto,
} from '../dto/notification-response.dto.js';

export class NotificationMapper {
  static toPreferenceResponseDto(
    entity: NotificationPreference,
  ): NotificationPreferenceResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      emailEnabled: entity.emailEnabled,
      smsEnabled: entity.smsEnabled,
      pushEnabled: entity.pushEnabled,
      updatedAt: entity.updatedAt,
    };
  }

  static toUpcomingResponseDto(
    entity: UpcomingMovieNotification,
  ): UpcomingMovieNotificationResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      movieId: entity.movieId,
      notifiedAt: entity.notifiedAt,
      createdAt: entity.createdAt,
      movieTitle: entity.movie?.title,
    };
  }

  static toUpcomingResponseDtoList(
    entities: UpcomingMovieNotification[],
  ): UpcomingMovieNotificationResponseDto[] {
    return entities.map((e) => this.toUpcomingResponseDto(e));
  }
}
