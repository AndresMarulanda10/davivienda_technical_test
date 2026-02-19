export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly total: string,
    public readonly itemCount: number,
  ) {}
}
