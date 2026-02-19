import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserOrdersQuery } from './get-user-orders.query';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from '../../../domain/repositories/order.repository.interface';

@QueryHandler(GetUserOrdersQuery)
export class GetUserOrdersHandler implements IQueryHandler<GetUserOrdersQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(query: GetUserOrdersQuery) {
    return this.orderRepo.findByUserId(query.userId);
  }
}
