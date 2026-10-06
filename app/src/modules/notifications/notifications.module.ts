import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationPreference } from './entities/notification-preference.entity.js';
import { UpcomingMovieNotification } from './entities/upcoming-movie-notification.entity.js';

import { NotificationPreferenceDao } from './dao/notification-preference.dao.js';
import { UpcomingMovieNotificationDao } from './dao/upcoming-movie-notification.dao.js';
import { NotificationMapper } from './mappers/notification.mapper.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationPreference,
      UpcomingMovieNotification,
    ]),
  ],
  providers: [
    NotificationPreferenceDao,
    UpcomingMovieNotificationDao,
    NotificationMapper,
  ],
  exports: [
    TypeOrmModule,
    NotificationPreferenceDao,
    UpcomingMovieNotificationDao,
    NotificationMapper,
  ],
})
export class NotificationsModule {}
