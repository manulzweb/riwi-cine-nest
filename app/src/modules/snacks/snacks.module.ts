import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entity.js';
import { Snack } from './entities/snack.entity.js';

import { SnackDao } from './dao/snack.dao.js';
import { PromotionDao } from './dao/promotion.dao.js';
import { SnackMapper } from './mappers/snack.mapper.js';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion, Snack])],
  providers: [SnackDao, PromotionDao, SnackMapper],
  exports: [TypeOrmModule, SnackDao, PromotionDao, SnackMapper],
})
export class SnacksModule {}
