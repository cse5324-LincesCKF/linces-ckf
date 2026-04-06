import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants/roles.constant';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active, in-stock products with filters' })
  @ApiResponse({ status: 200, description: 'Products returned successfully' })
  getProducts(@Query() query: QueryProductsDto) {
    return this.productsService.getProducts(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Return product details by id' })
  @ApiResponse({ status: 200, description: 'Product returned successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product record' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  createProduct(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.createProduct(user.userId, dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product record' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  updateProduct(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(user.userId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a product record' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  deleteProduct(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.productsService.deleteProduct(user.userId, id);
  }

  @Patch(':id/inventory')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product inventory' })
  @ApiBody({ type: UpdateInventoryDto })
  @ApiResponse({ status: 200, description: 'Inventory updated successfully' })
  updateInventory(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.productsService.updateInventory(user.userId, id, dto);
  }
}
