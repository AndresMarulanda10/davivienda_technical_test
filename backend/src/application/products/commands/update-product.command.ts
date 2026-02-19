import { UpdateProductData } from '../../../domain/repositories/product.repository.interface';

export class UpdateProductCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateProductData,
  ) {}
}
