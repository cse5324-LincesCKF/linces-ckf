import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { decimalTransformer } from '../../common/constants/database.constants';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 160 })
  name_en!: string;

  @Column({ length: 160 })
  name_es!: string;

  @Column({ type: 'text' })
  description_en!: string;

  @Column({ type: 'text' })
  description_es!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  price!: number;

  @Column({ type: 'int' })
  stockQuantity!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ length: 120 })
  category!: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  size!: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  color!: string | null;

  @Column('text', { array: true, default: '{}' })
  imageUrls!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems?: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems?: OrderItem[];
}
