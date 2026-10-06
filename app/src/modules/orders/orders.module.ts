import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseHistory } from './entities/purchase-history.entity.js';

import { PurchaseHistoryDao } from './dao/purchase-history.dao.js';
import { PurchaseHistoryMapper } from './mappers/purchase-history.mapper.js';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseHistory])],
  providers: [PurchaseHistoryDao, PurchaseHistoryMapper],
  exports: [TypeOrmModule, PurchaseHistoryDao, PurchaseHistoryMapper],
})
export class OrdersModule {}
