import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrdersController } from './orders.controller';
import { GetUserOrdersHandler } from './queries/get-user-orders.handler';
import { GetOrderByIdHandler } from './queries/get-order-by-id.handler';
import { GetAllOrdersHandler } from './queries/get-all-orders.handler';
import { UpdateOrderStatusHandler } from './commands/update-order-status.handler';
import { OrderCreatedHandler } from './handlers/order-created.handler';
import { PrismaOrderRepository } from '../../infrastructure/database/repositories/prisma-order.repository';
import { ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';

const QueryHandlers = [
  GetUserOrdersHandler,
  GetOrderByIdHandler,
  GetAllOrdersHandler,
];

const CommandHandlers = [UpdateOrderStatusHandler];

@Module({
  imports: [CqrsModule, AuthModule, DatabaseModule],
  controllers: [OrdersController],
  providers: [
    ...QueryHandlers,
    ...CommandHandlers,
    OrderCreatedHandler,
    {
      provide: ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY],
})
export class OrdersModule {}
