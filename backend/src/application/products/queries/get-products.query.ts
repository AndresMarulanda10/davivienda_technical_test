import { ProductFilters } from '../../../domain/repositories/product.repository.interface';

export class GetProductsQuery {
  constructor(public readonly filters: ProductFilters) {}
}
