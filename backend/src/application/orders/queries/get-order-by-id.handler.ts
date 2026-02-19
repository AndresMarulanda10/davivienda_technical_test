import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetOrderByIdQuery } from './get-order-by-id.query';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from '../../../domain/repositories/order.repository.interface';

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdHandler implements IQueryHandler<GetOrderByIdQuery> {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(query: GetOrderByIdQuery) {
    const order = await this.orderRepo.findById(query.orderId);

    if (!order) {
      throw new NotFoundException(`Order ${query.orderId} not found`);
    }

    if (order.userId !== query.userId) {
      throw new ForbiddenException('You cannot access this order');
    }

    return order;
  }
}
