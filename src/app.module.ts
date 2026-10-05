// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CinemasModule } from './modules/cinemas/cinemas.module';
import { HealthModule } from './modules/health/health.module';
import { LocationsModule } from './modules/locations/locations.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { MoviesModule } from './modules/movies/movies.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ShowtimesModule } from './modules/showtimes/showtimes.module';
import { SnacksModule } from './modules/snacks/snacks.module';
import { UsersModule } from './modules/users/users.module';

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
  providers: [AppService],
})
export class AppModule {}
