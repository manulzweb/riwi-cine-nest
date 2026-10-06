import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { Cart } from '../entities/cart.entity.js';

@Injectable()
export class CartDao extends BaseDao<Cart> {
  constructor(
    @InjectRepository(Cart)
    repository: Repository<Cart>,
  ) {
    super(repository);
  }
}
