import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import {
  PRODUCTS_REPOSITORY,
  ProductsRepository,
} from './products.repository';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), AuditLogModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository,
    {
      provide: PRODUCTS_REPOSITORY,
      useExisting: ProductsRepository,
    },
  ],
  exports: [ProductsService, PRODUCTS_REPOSITORY],
})
export class ProductsModule {}
