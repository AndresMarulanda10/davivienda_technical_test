import { Test, TestingModule } from '@nestjs/testing';
import { GetProductsHandler } from './get-products.handler';
import { GetProductsQuery } from './get-products.query';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
  PaginatedProducts,
  ProductFilters,
} from '../../../domain/repositories/product.repository.interface';

describe('GetProductsHandler', () => {
  let handler: GetProductsHandler;
  let repo: jest.Mocked<IProductRepository>;

  const mockPaginated: PaginatedProducts = {
    data: [
      {
        id: 'prod-1',
        name: 'Test Product',
        description: 'A test product',
        price: '29.99',
        stock: 10,
        imageUrl: 'https://example.com/img.png',
        isActive: true,
        categoryId: 'cat-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductsHandler,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockPaginated),
          },
        },
      ],
    }).compile();

    handler = module.get<GetProductsHandler>(GetProductsHandler);
    repo = module.get(PRODUCT_REPOSITORY);
  });

  it('should delegate to repository with correct filters', async () => {
    const filters: ProductFilters = {
      page: 1,
      limit: 10,
      search: 'test',
      categoryId: 'cat-1',
    };

    const result = await handler.execute(new GetProductsQuery(filters));

    expect(repo.findAll).toHaveBeenCalledWith(filters);
    expect(result).toEqual(mockPaginated);
  });

  it('should pass default pagination without optional filters', async () => {
    const filters: ProductFilters = { page: 2, limit: 5 };

    await handler.execute(new GetProductsQuery(filters));

    expect(repo.findAll).toHaveBeenCalledWith({ page: 2, limit: 5 });
  });
});
