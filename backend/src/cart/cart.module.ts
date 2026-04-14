import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';
import { CartController } from './cart.controller';
import { CartRepository, CART_REPOSITORY } from './cart.repository';
import { CartService } from './cart.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), ProductsModule],
  controllers: [CartController],
  providers: [
    CartService,
    CartRepository,
    {
      provide: CART_REPOSITORY,
      useExisting: CartRepository,
    },
  ],
  exports: [CartService, CART_REPOSITORY],
})
export class CartModule {}
