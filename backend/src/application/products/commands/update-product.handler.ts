import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateProductCommand } from './update-product.command';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
  ProductRecord,
} from '../../../domain/repositories/product.repository.interface';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repo: IProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<ProductRecord> {
    const existing = await this.repo.findById(command.id);

    if (!existing) {
      throw new NotFoundException(`Product ${command.id} not found`);
    }

    return this.repo.update(command.id, command.dto);
  }
}
