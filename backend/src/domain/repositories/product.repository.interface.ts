export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category?: CategoryRecord;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface ProductFilters {
  page: number;
  limit: number;
  categoryId?: string;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedProducts {
  data: ProductRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface IProductRepository {
  findAll(filters: ProductFilters): Promise<PaginatedProducts>;
  findById(id: string): Promise<ProductRecord | null>;
  findByIdActive(id: string): Promise<ProductRecord | null>;
  create(data: CreateProductData): Promise<ProductRecord>;
  update(id: string, data: UpdateProductData): Promise<ProductRecord>;
  softDelete(id: string): Promise<void>;
  decrementStock(id: string, quantity: number): Promise<void>;
}

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';
