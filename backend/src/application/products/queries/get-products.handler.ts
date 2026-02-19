import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetProductsQuery } from './get-products.query';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
  PaginatedProducts,
} from '../../../domain/repositories/product.repository.interface';

@QueryHandler(GetProductsQuery)
export class GetProductsHandler implements IQueryHandler<GetProductsQuery> {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly repo: IProductRepository,
  ) {}

  async execute(query: GetProductsQuery): Promise<PaginatedProducts> {
    return this.repo.findAll(query.filters);
  }
}
