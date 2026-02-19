import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductsController } from './products.controller';
import { CreateProductHandler } from './commands/create-product.handler';
import { UpdateProductHandler } from './commands/update-product.handler';
import { DeleteProductHandler } from './commands/delete-product.handler';
import { GetProductsHandler } from './queries/get-products.handler';
import { GetProductByIdHandler } from './queries/get-product-by-id.handler';
import { PrismaProductRepository } from '../../infrastructure/database/repositories/prisma-product.repository';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';

const CommandHandlers = [
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
];

const QueryHandlers = [GetProductsHandler, GetProductByIdHandler];

@Module({
  imports: [CqrsModule, AuthModule, DatabaseModule],
  controllers: [ProductsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
