import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { MockPaymentStrategy } from './strategies/mock-payment.strategy';
import { NoDiscountStrategy } from './strategies/no-discount.strategy';
import { PAYMENT_STRATEGY } from './strategies/payment-strategy.interface';
import { DISCOUNT_STRATEGY } from './strategies/discount-strategy.interface';
import { AuthModule } from '../auth/auth.module';
import { CartModule } from '../cart/cart.module';
import { OrdersModule } from '../orders/orders.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [AuthModule, CartModule, OrdersModule, DatabaseModule],
  controllers: [CheckoutController],
  providers: [
    CheckoutService,
    {
      provide: PAYMENT_STRATEGY,
      useClass: MockPaymentStrategy,
    },
    {
      provide: DISCOUNT_STRATEGY,
      useClass: NoDiscountStrategy,
    },
  ],
})
export class CheckoutModule {}
