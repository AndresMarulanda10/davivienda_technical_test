import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetProductByIdQuery } from './get-product-by-id.query';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
  ProductRecord,
} from '../../../domain/repositories/product.repository.interface';

@QueryHandler(GetProductByIdQuery)
export class GetProductByIdHandler implements IQueryHandler<GetProductByIdQuery> {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly repo: IProductRepository,
  ) {}

  async execute(query: GetProductByIdQuery): Promise<ProductRecord> {
    const product = await this.repo.findByIdActive(query.id);

    if (!product) {
      throw new NotFoundException(`Product ${query.id} not found`);
    }

    return product;
  }
}
