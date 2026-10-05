import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationPreference } from './entities/notification-preference.entity';
import { UpcomingMovieNotification } from './entities/upcoming-movie-notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationPreference,
      UpcomingMovieNotification,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class NotificationsModule {}
