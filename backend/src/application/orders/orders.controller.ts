import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '../../domain/entities/role.enum';
import { GetUserOrdersQuery } from './queries/get-user-orders.query';
import { GetOrderByIdQuery } from './queries/get-order-by-id.query';
import { GetAllOrdersQuery } from './queries/get-all-orders.query';
import { UpdateOrderStatusCommand } from './commands/update-order-status.command';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('orders')
  async getUserOrders(@CurrentUser() user: JwtPayload) {
    return this.queryBus.execute(new GetUserOrdersQuery(user.sub));
  }

  @Get('orders/:id')
  async getOrderById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.queryBus.execute(new GetOrderByIdQuery(id, user.sub));
  }

  @Get('admin/orders')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getAllOrders() {
    return this.queryBus.execute(new GetAllOrdersQuery());
  }

  @Patch('admin/orders/:id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.commandBus.execute(new UpdateOrderStatusCommand(id, dto.status));
  }
}
