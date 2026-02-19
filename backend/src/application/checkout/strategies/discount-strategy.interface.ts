export interface DiscountResult {
  discountAmount: number;
  finalTotal: number;
}

export interface IDiscountStrategy {
  apply(subtotal: number): DiscountResult;
}

export const DISCOUNT_STRATEGY = 'DISCOUNT_STRATEGY';
