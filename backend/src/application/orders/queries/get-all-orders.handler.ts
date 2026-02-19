import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllOrdersQuery } from './get-all-orders.query';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from '../../../domain/repositories/order.repository.interface';

@QueryHandler(GetAllOrdersQuery)
export class GetAllOrdersHandler implements IQueryHandler<GetAllOrdersQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(_query: GetAllOrdersQuery) {
    return this.orderRepo.findAll();
  }
}
