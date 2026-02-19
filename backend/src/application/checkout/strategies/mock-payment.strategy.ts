import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IPaymentStrategy, PaymentResult } from './payment-strategy.interface';

@Injectable()
export class MockPaymentStrategy implements IPaymentStrategy {
  async process(_total: number, _metadata: Record<string, unknown>): Promise<PaymentResult> {
    // Simulate payment gateway latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      approved: true,
      reference: uuidv4(),
    };
  }
}
