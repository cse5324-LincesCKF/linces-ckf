import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'cart_items' })
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { nullable: false, onDelete: 'CASCADE' })
  cart!: Cart;

  @ManyToOne(() => Product, (product) => product.cartItems, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: true,
  })
  product!: Product;

  @Column({ type: 'int' })
  quantity!: number;
}
