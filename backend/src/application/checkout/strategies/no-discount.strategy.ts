import { Injectable } from '@nestjs/common';
import { IDiscountStrategy, DiscountResult } from './discount-strategy.interface';

@Injectable()
export class NoDiscountStrategy implements IDiscountStrategy {
  apply(subtotal: number): DiscountResult {
    return {
      discountAmount: 0,
      finalTotal: subtotal,
    };
  }
}
