import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseHistory } from './entities/purchase-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseHistory])],
  exports: [TypeOrmModule],
})
export class OrdersModule {}
