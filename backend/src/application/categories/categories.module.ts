import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
