import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateOrderStatusCommand } from './update-order-status.command';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from '../../../domain/repositories/order.repository.interface';

@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler
  implements ICommandHandler<UpdateOrderStatusCommand>
{
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(command: UpdateOrderStatusCommand) {
    const order = await this.orderRepo.findById(command.orderId);

    if (!order) {
      throw new NotFoundException(`Order ${command.orderId} not found`);
    }

    return this.orderRepo.updateStatus(command.orderId, command.status);
  }
}
