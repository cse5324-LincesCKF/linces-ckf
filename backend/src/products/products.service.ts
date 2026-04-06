import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, AuditEntityType } from '../common/constants/audit.constants';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  IProductsRepository,
  PRODUCTS_REPOSITORY,
} from './products.repository';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: IProductsRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getProducts(query: QueryProductsDto) {
    const products = await this.productsRepository.findCatalog(query);
    return products.map((product) => this.toResponse(product));
  }

  async getProductById(id: string) {
    const product = await this.findProductOrFail(id);

    if (!product.isActive) {
      throw new NotFoundException('Product not found');
    }

    return this.toResponse(product);
  }

  async createProduct(adminId: string, dto: CreateProductDto) {
    const product = this.productsRepository.create({
      ...dto,
      isActive: true,
      size: dto.size ?? null,
      color: dto.color ?? null,
    });
    const savedProduct = await this.productsRepository.save(product);

    await this.auditLogService.logAction(
      adminId,
      AuditAction.CREATE_PRODUCT,
      AuditEntityType.PRODUCT,
      savedProduct.id,
    );

    return this.toResponse(savedProduct);
  }

  async updateProduct(adminId: string, id: string, dto: UpdateProductDto) {
    const product = await this.findProductOrFail(id);
    Object.assign(product, dto);
    const savedProduct = await this.productsRepository.save(product);

    await this.auditLogService.logAction(
      adminId,
      AuditAction.UPDATE_PRODUCT,
      AuditEntityType.PRODUCT,
      savedProduct.id,
    );

    return this.toResponse(savedProduct);
  }

  async deleteProduct(adminId: string, id: string) {
    const product = await this.findProductOrFail(id);
    product.isActive = false;
    const savedProduct = await this.productsRepository.save(product);

    await this.auditLogService.logAction(
      adminId,
      AuditAction.DELETE_PRODUCT,
      AuditEntityType.PRODUCT,
      savedProduct.id,
    );

    return this.toResponse(savedProduct);
  }

  async updateInventory(adminId: string, id: string, dto: UpdateInventoryDto) {
    if (dto.stockQuantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    const product = await this.findProductOrFail(id);
    product.stockQuantity = dto.stockQuantity;
    const savedProduct = await this.productsRepository.save(product);

    await this.auditLogService.logAction(
      adminId,
      AuditAction.UPDATE_PRODUCT,
      AuditEntityType.PRODUCT,
      savedProduct.id,
    );

    return this.toResponse(savedProduct);
  }

  async getInventoryView() {
    const products = await this.productsRepository.findAll();
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
      category: product.category,
      updatedAt: product.updatedAt,
    }));
  }

  async countProducts(): Promise<number> {
    return this.productsRepository.countAll();
  }

  private async findProductOrFail(id: string): Promise<Product> {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private toResponse(product: Product) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      stockStatus: product.stockQuantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      isActive: product.isActive,
      category: product.category,
      size: product.size,
      color: product.color,
      imageUrls: product.imageUrls,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
