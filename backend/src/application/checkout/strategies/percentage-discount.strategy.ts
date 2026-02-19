import { Injectable } from '@nestjs/common';
import { IDiscountStrategy, DiscountResult } from './discount-strategy.interface';

@Injectable()
export class PercentageDiscountStrategy implements IDiscountStrategy {
  constructor(private readonly percentage: number) {}

  apply(subtotal: number): DiscountResult {
    const discountAmount = parseFloat(
      ((subtotal * this.percentage) / 100).toFixed(2),
    );
    const finalTotal = parseFloat((subtotal - discountAmount).toFixed(2));

    return {
      discountAmount,
      finalTotal,
    };
  }
}
