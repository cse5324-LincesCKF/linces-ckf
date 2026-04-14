import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { QueryProductsDto } from './dto/query-products.dto';

export const PRODUCTS_REPOSITORY = Symbol('PRODUCTS_REPOSITORY');

export interface IProductsRepository {
  create(data: Partial<Product>): Product;
  save(product: Product, manager?: EntityManager): Promise<Product>;
  saveMany(products: Product[], manager?: EntityManager): Promise<Product[]>;
  findCatalog(query: QueryProductsDto): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByIds(ids: string[], manager?: EntityManager): Promise<Product[]>;
  findAll(): Promise<Product[]>;
  countAll(): Promise<number>;
}

@Injectable()
export class ProductsRepository implements IProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  create(data: Partial<Product>): Product {
    return this.repository.create(data);
  }

  save(product: Product, manager?: EntityManager): Promise<Product> {
    return this.getRepository(manager).save(product);
  }

  saveMany(products: Product[], manager?: EntityManager): Promise<Product[]> {
    return this.getRepository(manager).save(products);
  }

  async findCatalog(query: QueryProductsDto): Promise<Product[]> {
    const builder = this.repository.createQueryBuilder('product');

    builder.where('product.isActive = :isActive', { isActive: true });
    builder.andWhere('product.stockQuantity > :stock', { stock: 0 });

    if (query.search) {
      builder.andWhere(
        '(LOWER(product.name_en) LIKE LOWER(:search) OR LOWER(product.name_es) LIKE LOWER(:search) OR LOWER(product.description_en) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    if (query.category) {
      builder.andWhere('LOWER(product.category) = LOWER(:category)', {
        category: query.category,
      });
    }

    if (query.minPrice !== undefined) {
      builder.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      builder.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.size) {
      builder.andWhere('LOWER(product.size) = LOWER(:size)', { size: query.size });
    }

    if (query.color) {
      builder.andWhere('LOWER(product.color) = LOWER(:color)', { color: query.color });
    }

    return builder.orderBy('product.createdAt', 'DESC').getMany();
  }

  findById(id: string): Promise<Product | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByIds(ids: string[], manager?: EntityManager): Promise<Product[]> {
    return this.getRepository(manager).find({ where: { id: In(ids) } });
  }

  findAll(): Promise<Product[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  countAll(): Promise<number> {
    return this.repository.count();
  }

  private getRepository(manager?: EntityManager): Repository<Product> {
    return manager ? manager.getRepository(Product) : this.repository;
  }
}
