import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteProductCommand } from './delete-product.command';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '../../../domain/repositories/product.repository.interface';

@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler implements ICommandHandler<DeleteProductCommand> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repo: IProductRepository) {}

  async execute(command: DeleteProductCommand): Promise<void> {
    const existing = await this.repo.findById(command.id);

    if (!existing) {
      throw new NotFoundException(`Product ${command.id} not found`);
    }

    await this.repo.softDelete(command.id);
  }
}
