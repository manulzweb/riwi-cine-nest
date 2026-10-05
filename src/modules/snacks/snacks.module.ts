import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entity';
import { Snack } from './entities/snack.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion, Snack])],
  exports: [TypeOrmModule],
})
export class SnacksModule {}
