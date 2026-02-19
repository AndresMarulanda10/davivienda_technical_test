import { IsEnum } from 'class-validator';

enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: 'Status must be one of: PENDING, PROCESSING, COMPLETED, CANCELLED',
  })
  status: OrderStatus;
}
