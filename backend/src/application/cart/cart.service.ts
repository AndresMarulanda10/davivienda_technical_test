import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { RedisService } from '../../infrastructure/cache/redis.service';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '../../domain/repositories/product.repository.interface';

export interface CartItem {
  productId: string;
  name: string;
  price: string;
  imageUrl: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: string;
}

const CART_TTL = 60 * 60 * 24 * 7; // 7 days in seconds
const CART_KEY = (userId: string) => `cart:${userId}`;

@Injectable()
export class CartService {
  constructor(
    private readonly redis: RedisService,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: IProductRepository,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    const raw = await this.redis.hgetall(CART_KEY(userId));
    const items: CartItem[] = Object.values(raw).map((v) => JSON.parse(v));

    let totalPrice = 0;
    let totalItems = 0;
    for (const item of items) {
      totalPrice += parseFloat(item.price) * item.quantity;
      totalItems += item.quantity;
    }

    return {
      userId,
      items,
      totalItems,
      totalPrice: totalPrice.toFixed(2),
    };
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<Cart> {
    const product = await this.productRepo.findByIdActive(productId);
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const key = CART_KEY(userId);
    const existing = await this.redis.hget(key, productId);
    const currentQty = existing ? (JSON.parse(existing) as CartItem).quantity : 0;
    const newQty = currentQty + quantity;

    if (newQty > product.stock) {
      throw new ConflictException(
        `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${newQty}`,
      );
    }

    const item: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: newQty,
    };

    await this.redis.hset(key, productId, JSON.stringify(item));
    await this.redis.expire(key, CART_TTL);

    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, quantity: number): Promise<Cart> {
    const key = CART_KEY(userId);
    const existing = await this.redis.hget(key, productId);
    if (!existing) {
      throw new NotFoundException(`Item ${productId} not in cart`);
    }

    const product = await this.productRepo.findByIdActive(productId);
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    if (quantity > product.stock) {
      throw new ConflictException(
        `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${quantity}`,
      );
    }

    const item: CartItem = {
      ...JSON.parse(existing),
      quantity,
    };

    await this.redis.hset(key, productId, JSON.stringify(item));
    await this.redis.expire(key, CART_TTL);

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const key = CART_KEY(userId);
    const existing = await this.redis.hget(key, productId);
    if (!existing) {
      throw new NotFoundException(`Item ${productId} not in cart`);
    }

    await this.redis.hdel(key, productId);
    await this.redis.expire(key, CART_TTL);

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    await this.redis.del(CART_KEY(userId));
  }
}
