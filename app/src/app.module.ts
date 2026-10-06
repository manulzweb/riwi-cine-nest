// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CommonModule } from './common/common.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { AuthGuard } from './common/guards/auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import configuration from './config/configuration.js';
import { validate } from './config/env.validation.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { CinemasModule } from './modules/cinemas/cinemas.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { LocationsModule } from './modules/locations/locations.module.js';
import { LoyaltyModule } from './modules/loyalty/loyalty.module.js';
import { MoviesModule } from './modules/movies/movies.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { ReservationsModule } from './modules/reservations/reservations.module.js';
import { ShowtimesModule } from './modules/showtimes/showtimes.module.js';
import { SnacksModule } from './modules/snacks/snacks.module.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host', 'localhost'),
        port: configService.get<number>('database.port', 5432),
        username: configService.get<string>('database.username', 'postgres'),
        password: configService.get<string>('database.password', ''),
        database: configService.get<string>('database.database', 'postgres'),
        synchronize: false,
        logging: configService.get<boolean>('database.logging', false),
        autoLoadEntities: true,
      }),
    }),
    CommonModule,
    HealthModule,
    AuthModule,
    UsersModule,
    LocationsModule,
    CinemasModule,
    MoviesModule,
    ShowtimesModule,
    LoyaltyModule,
    NotificationsModule,
    ReservationsModule,
    SnacksModule,
    CartModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
