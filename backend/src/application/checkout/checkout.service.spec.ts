import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CheckoutService } from './checkout.service';
import { CartService, Cart } from '../cart/cart.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { PAYMENT_STRATEGY } from './strategies/payment-strategy.interface';
import { DISCOUNT_STRATEGY } from './strategies/discount-strategy.interface';
import { ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let cartService: jest.Mocked<CartService>;
  let prisma: { $transaction: jest.Mock };
  let paymentStrategy: { process: jest.Mock };
  let discountStrategy: { apply: jest.Mock };
  let eventEmitter: { emit: jest.Mock };

  const userId = 'user-1';

  const cartWithItems: Cart = {
    userId,
    items: [
      {
        productId: 'prod-1',
        name: 'Test Product',
        price: '50.00',
        imageUrl: 'https://example.com/img.png',
        quantity: 2,
      },
    ],
    totalItems: 2,
    totalPrice: '100.00',
  };

  const emptyCart: Cart = {
    userId,
    items: [],
    totalItems: 0,
    totalPrice: '0.00',
  };

  // Mock tx object returned inside $transaction callback
  const mockTx = {
    $queryRawUnsafe: jest.fn(),
    product: { update: jest.fn() },
    order: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockCreatedOrder = {
    id: 'order-1',
    userId,
    status: 'COMPLETED',
    subtotal: { toString: () => '100.00' },
    discountAmount: { toString: () => '0' },
    total: { toString: () => '100.00' },
    paymentReference: 'pay-ref-1',
    paymentStatus: 'APPROVED',
    orderItems: [
      {
        productId: 'prod-1',
        productName: 'Test Product',
        unitPrice: { toString: () => '50.00' },
        quantity: 2,
        subtotal: { toString: () => '100.00' },
      },
    ],
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockTx.$queryRawUnsafe.mockReset();
    mockTx.product.update.mockReset();
    mockTx.order.create.mockReset();
    mockTx.order.update.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: CartService,
          useValue: {
            getCart: jest.fn(),
            clearCart: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
          },
        },
        {
          provide: PAYMENT_STRATEGY,
          useValue: {
            process: jest.fn(),
          },
        },
        {
          provide: DISCOUNT_STRATEGY,
          useValue: {
            apply: jest.fn().mockReturnValue({
              discountAmount: 0,
              finalTotal: 100.0,
            }),
          },
        },
        {
          provide: ORDER_REPOSITORY,
          useValue: {},
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    cartService = module.get(CartService);
    prisma = module.get(PrismaService);
    paymentStrategy = module.get(PAYMENT_STRATEGY);
    discountStrategy = module.get(DISCOUNT_STRATEGY);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('processCheckout', () => {
    it('should throw BadRequestException when cart is empty', async () => {
      cartService.getCart.mockResolvedValue(emptyCart);

      await expect(service.processCheckout(userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should complete checkout successfully', async () => {
      cartService.getCart.mockResolvedValue(cartWithItems);
      cartService.clearCart.mockResolvedValue(undefined);

      // Mock $transaction to invoke the callback with mockTx
      prisma.$transaction.mockImplementation(async (cb: Function) => {
        return cb(mockTx);
      });

      // Stock check passes
      mockTx.$queryRawUnsafe.mockResolvedValue([
        { id: 'prod-1', stock: 10, name: 'Test Product' },
      ]);
      mockTx.product.update.mockResolvedValue({});
      mockTx.order.create.mockResolvedValue(mockCreatedOrder);

      // Payment approved
      paymentStrategy.process.mockResolvedValue({
        approved: true,
        reference: 'pay-ref-1',
      });

      // Final order update
      mockTx.order.update.mockResolvedValue(mockCreatedOrder);

      const result = await service.processCheckout(userId);

      expect(result.id).toBe('order-1');
      expect(result.status).toBe('COMPLETED');
      expect(result.paymentReference).toBe('pay-ref-1');
      expect(cartService.clearCart).toHaveBeenCalledWith(userId);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'order.created',
        expect.objectContaining({ orderId: 'order-1' }),
      );
    });

    it('should throw ConflictException when stock is insufficient', async () => {
      cartService.getCart.mockResolvedValue(cartWithItems);

      prisma.$transaction.mockImplementation(async (cb: Function) => {
        return cb(mockTx);
      });

      // Stock check fails -- only 1 unit available, 2 requested
      mockTx.$queryRawUnsafe.mockResolvedValue([
        { id: 'prod-1', stock: 1, name: 'Test Product' },
      ]);

      await expect(service.processCheckout(userId)).rejects.toThrow(
        ConflictException,
      );

      expect(cartService.clearCart).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when payment is rejected', async () => {
      cartService.getCart.mockResolvedValue(cartWithItems);

      prisma.$transaction.mockImplementation(async (cb: Function) => {
        return cb(mockTx);
      });

      // Stock check passes
      mockTx.$queryRawUnsafe.mockResolvedValue([
        { id: 'prod-1', stock: 10, name: 'Test Product' },
      ]);
      mockTx.product.update.mockResolvedValue({});
      mockTx.order.create.mockResolvedValue({
        ...mockCreatedOrder,
        status: 'PENDING',
      });

      // Payment rejected
      paymentStrategy.process.mockResolvedValue({
        approved: false,
        reference: '',
      });

      // Order update for rejected status
      mockTx.order.update.mockResolvedValue({
        ...mockCreatedOrder,
        status: 'CANCELLED',
        paymentStatus: 'REJECTED',
      });

      await expect(service.processCheckout(userId)).rejects.toThrow(
        ConflictException,
      );

      expect(cartService.clearCart).not.toHaveBeenCalled();
    });
  });
});
