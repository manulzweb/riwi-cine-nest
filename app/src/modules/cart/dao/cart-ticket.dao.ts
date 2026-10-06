import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDao } from '../../../common/dao/base.dao.js';
import { CartTicket } from '../entities/cart-ticket.entity.js';

@Injectable()
export class CartTicketDao extends BaseDao<CartTicket> {
  constructor(
    @InjectRepository(CartTicket)
    repository: Repository<CartTicket>,
  ) {
    super(repository);
  }
}
