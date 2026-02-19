import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '../../../domain/events/order-created.event';

@Injectable()
export class OrderCreatedHandler {
  private readonly logger = new Logger(OrderCreatedHandler.name);

  @OnEvent('order.created')
  handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(
      `[OrderCreated] Order ${event.orderId} | User ${event.userId} | Total: $${event.total} | Items: ${event.itemCount}`,
    );
  }
}
