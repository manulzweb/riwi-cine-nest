import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { CartItem } from '../entities/cart-item.entity.js';

@Injectable()
export class CartItemDao extends BaseDao<CartItem> {
  constructor(
    @InjectRepository(CartItem)
    repository: Repository<CartItem>,
  ) {
    super(repository);
  }
}
