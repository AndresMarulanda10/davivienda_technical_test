import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { CreateProductCommand } from './commands/create-product.command';
import { UpdateProductCommand } from './commands/update-product.command';
import { DeleteProductCommand } from './commands/delete-product.command';
import { GetProductsQuery } from './queries/get-products.query';
import { GetProductByIdQuery } from './queries/get-product-by-id.query';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../../domain/entities/role.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getProducts(@Query() query: GetProductsQueryDto) {
    return this.queryBus.execute(
      new GetProductsQuery({
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        categoryId: query.categoryId,
        search: query.search,
        isActive: query.isActive,
      }),
    );
  }

  @Get(':id')
  async getProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetProductByIdQuery(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createProduct(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commandBus.execute(new CreateProductCommand(dto, user.sub));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.commandBus.execute(new UpdateProductCommand(id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    await this.commandBus.execute(new DeleteProductCommand(id));
  }
}
