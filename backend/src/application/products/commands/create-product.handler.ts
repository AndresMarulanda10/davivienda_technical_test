import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CreateProductCommand } from './create-product.command';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
  ProductRecord,
} from '../../../domain/repositories/product.repository.interface';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly repo: IProductRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<ProductRecord> {
    return this.repo.create(command.dto);
  }
}
