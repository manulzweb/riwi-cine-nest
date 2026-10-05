import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CinemaFunction } from './entities/cinema-function.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CinemaFunction])],
  exports: [TypeOrmModule],
})
export class ShowtimesModule {}
