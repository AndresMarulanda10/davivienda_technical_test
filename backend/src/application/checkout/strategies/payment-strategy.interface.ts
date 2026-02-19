export interface PaymentResult {
  approved: boolean;
  reference: string;
}

export interface IPaymentStrategy {
  process(total: number, metadata: Record<string, unknown>): Promise<PaymentResult>;
}

export const PAYMENT_STRATEGY = 'PAYMENT_STRATEGY';
