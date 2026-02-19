import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  IOrderRepository,
  OrderRecord,
  OrderItemRecord,
  CreateOrderData,
} from '../../../domain/repositories/order.repository.interface';

type RawOrder = {
  id: string;
  userId: string;
  status: string;
  subtotal: { toString(): string };
  discountAmount: { toString(): string };
  total: { toString(): string };
  paymentReference: string | null;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  orderItems?: RawOrderItem[];
};

type RawOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: { toString(): string };
  quantity: number;
  subtotal: { toString(): string };
};

function toRecord(raw: RawOrder): OrderRecord {
  return {
    id: raw.id,
    userId: raw.userId,
    status: raw.status,
    subtotal: raw.subtotal.toString(),
    discountAmount: raw.discountAmount.toString(),
    total: raw.total.toString(),
    paymentReference: raw.paymentReference,
    paymentStatus: raw.paymentStatus,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    orderItems: raw.orderItems?.map(toItemRecord),
  };
}

function toItemRecord(raw: RawOrderItem): OrderItemRecord {
  return {
    id: raw.id,
    orderId: raw.orderId,
    productId: raw.productId,
    productName: raw.productName,
    unitPrice: raw.unitPrice.toString(),
    quantity: raw.quantity,
    subtotal: raw.subtotal.toString(),
  };
}

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrderData): Promise<OrderRecord> {
    const order = await this.prisma.order.create({
      data: {
        userId: data.userId,
        subtotal: data.subtotal,
        discountAmount: data.discountAmount,
        total: data.total,
        orderItems: {
          create: data.orderItems,
        },
      },
      include: { orderItems: true },
    });

    return toRecord(order as unknown as RawOrder);
  }

  async findById(id: string): Promise<OrderRecord | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) return null;

    return toRecord(order as unknown as RawOrder);
  }

  async findByUserId(userId: string): Promise<OrderRecord[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' },
    });

    return (orders as unknown as RawOrder[]).map(toRecord);
  }

  async findAll(): Promise<OrderRecord[]> {
    const orders = await this.prisma.order.findMany({
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' },
    });

    return (orders as unknown as RawOrder[]).map(toRecord);
  }

  async updateStatus(id: string, status: string): Promise<OrderRecord> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: status as never },
      include: { orderItems: true },
    });

    return toRecord(order as unknown as RawOrder);
  }

  async updatePayment(
    id: string,
    paymentStatus: string,
    paymentReference: string,
    orderStatus: string,
  ): Promise<OrderRecord> {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        paymentStatus: paymentStatus as never,
        paymentReference,
        status: orderStatus as never,
      },
      include: { orderItems: true },
    });

    return toRecord(order as unknown as RawOrder);
  }
}
