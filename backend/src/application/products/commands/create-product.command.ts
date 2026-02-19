import { CreateProductData } from '../../../domain/repositories/product.repository.interface';

export class CreateProductCommand {
  constructor(
    public readonly dto: CreateProductData,
    public readonly adminId: string,
  ) {}
}
