// Frontend types matching backend API response shapes

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CartItemResponse {
  productId: string;
  name: string;
  price: string;
  imageUrl: string;
  quantity: number;
}

export interface CartResponse {
  userId: string;
  items: CartItemResponse[];
  totalItems: number;
  totalPrice: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentReference: string | null;
  subtotal: string;
  discountAmount: string;
  total: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CheckoutResponse {
  id: string;
  status: OrderStatus;
  subtotal: string;
  discountAmount: string;
  total: string;
  paymentReference: string;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
