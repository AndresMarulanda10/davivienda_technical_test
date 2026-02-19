import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  IProductRepository,
  ProductRecord,
  ProductFilters,
  PaginatedProducts,
  CreateProductData,
  UpdateProductData,
  CategoryRecord,
} from '../../../domain/repositories/product.repository.interface';

type RawProduct = {
  id: string;
  name: string;
  description: string;
  price: { toString(): string };
  stock: number;
  imageUrl: string;
  isActive: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category?: CategoryRecord | null;
};

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: ProductFilters): Promise<PaginatedProducts> {
    const { page, limit, categoryId, search, isActive } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(isActive !== undefined ? { isActive } : { isActive: true }),
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const toRecord = (p: RawProduct): ProductRecord => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      stock: p.stock,
      imageUrl: p.imageUrl,
      isActive: p.isActive,
      categoryId: p.categoryId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      category: p.category ?? undefined,
    });

    const [rawData, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: rawData.map(toRecord),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<ProductRecord | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) return null;

    return { ...product, price: product.price.toString() };
  }

  async findByIdActive(id: string): Promise<ProductRecord | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product || !product.isActive) return null;

    return { ...product, price: product.price.toString() };
  }

  async create(data: CreateProductData): Promise<ProductRecord> {
    const p = await this.prisma.product.create({
      data,
      include: { category: true },
    });

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      stock: p.stock,
      imageUrl: p.imageUrl,
      isActive: p.isActive,
      categoryId: p.categoryId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      category: p.category ?? undefined,
    };
  }

  async update(id: string, data: UpdateProductData): Promise<ProductRecord> {
    const p = await this.prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      stock: p.stock,
      imageUrl: p.imageUrl,
      isActive: p.isActive,
      categoryId: p.categoryId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      category: p.category ?? undefined,
    };
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async decrementStock(id: string, quantity: number): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { stock: { decrement: quantity } },
    });
  }
}
