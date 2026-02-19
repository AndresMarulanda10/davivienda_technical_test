export interface OrderRecord {
  id: string;
  userId: string;
  status: string;
  subtotal: string;
  discountAmount: string;
  total: string;
  paymentReference: string | null;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  orderItems?: OrderItemRecord[];
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface CreateOrderData {
  userId: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  orderItems: {
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }[];
}

export interface IOrderRepository {
  create(data: CreateOrderData): Promise<OrderRecord>;
  findById(id: string): Promise<OrderRecord | null>;
  findByUserId(userId: string): Promise<OrderRecord[]>;
  findAll(): Promise<OrderRecord[]>;
  updateStatus(id: string, status: string): Promise<OrderRecord>;
  updatePayment(
    id: string,
    paymentStatus: string,
    paymentReference: string,
    orderStatus: string,
  ): Promise<OrderRecord>;
}

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';
