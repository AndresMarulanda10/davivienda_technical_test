import {
  Injectable,
  Inject,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { CartService } from '../cart/cart.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import {
  IPaymentStrategy,
  PAYMENT_STRATEGY,
} from './strategies/payment-strategy.interface';
import {
  IDiscountStrategy,
  DISCOUNT_STRATEGY,
} from './strategies/discount-strategy.interface';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from '../../domain/repositories/order.repository.interface';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';

interface StockRow {
  id: string;
  stock: number;
  name: string;
}

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly cartService: CartService,
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_STRATEGY)
    private readonly paymentStrategy: IPaymentStrategy,
    @Inject(DISCOUNT_STRATEGY)
    private readonly discountStrategy: IDiscountStrategy,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepo: IOrderRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async processCheckout(userId: string) {
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Execute transactional checkout with row-level locking
    const order = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Lock and validate stock for each item
      for (const item of cart.items) {
        const rows = await tx.$queryRawUnsafe(
          'SELECT id, stock, name FROM products WHERE id = $1 FOR UPDATE',
          item.productId,
        ) as StockRow[];
        const product = rows[0];

        if (!product) {
          throw new ConflictException(
            `Product "${item.name}" is no longer available`,
          );
        }

        if (product.stock < item.quantity) {
          throw new ConflictException(
            `Insufficient stock for "${item.name}". Available: ${product.stock}, requested: ${item.quantity}`,
          );
        }
      }

      // Decrement stock for all items
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Calculate subtotal and apply discount
      const subtotal = parseFloat(cart.totalPrice);
      const { discountAmount, finalTotal } =
        this.discountStrategy.apply(subtotal);

      // Create order with items
      const created = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          subtotal,
          discountAmount,
          total: finalTotal,
          paymentStatus: 'PENDING',
          orderItems: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.name,
              unitPrice: parseFloat(item.price),
              quantity: item.quantity,
              subtotal: parseFloat(item.price) * item.quantity,
            })),
          },
        },
        include: { orderItems: true },
      });

      // Process payment
      const paymentResult = await this.paymentStrategy.process(finalTotal, {
        orderId: created.id,
        userId,
      });

      if (!paymentResult.approved) {
        // Payment rejected -- update order status accordingly
        await tx.order.update({
          where: { id: created.id },
          data: {
            paymentStatus: 'REJECTED',
            status: 'CANCELLED',
          },
        });

        throw new ConflictException('Payment was rejected');
      }

      // Payment approved -- update order with reference
      const finalOrder = await tx.order.update({
        where: { id: created.id },
        data: {
          paymentStatus: 'APPROVED',
          paymentReference: paymentResult.reference,
          status: 'COMPLETED',
        },
        include: { orderItems: true },
      });

      return finalOrder;
    });

    // Clear cart outside of transaction
    await this.cartService.clearCart(userId);

    // Emit domain event
    this.eventEmitter.emit(
      'order.created',
      new OrderCreatedEvent(
        order.id,
        userId,
        order.total.toString(),
        order.orderItems.length,
      ),
    );

    this.logger.log(`Order ${order.id} completed for user ${userId}`);

    return {
      id: order.id,
      status: order.status,
      subtotal: order.subtotal.toString(),
      discountAmount: order.discountAmount.toString(),
      total: order.total.toString(),
      paymentReference: order.paymentReference,
      paymentStatus: order.paymentStatus,
      items: order.orderItems.map((oi: Record<string, unknown>) => ({
        productId: oi.productId,
        productName: oi.productName,
        unitPrice: String(oi.unitPrice),
        quantity: oi.quantity,
        subtotal: String(oi.subtotal),
      })),
      createdAt: order.createdAt,
    };
  }
}
