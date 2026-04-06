import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItem } from './cart-item.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'carts' })
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.cart, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;

  @OneToMany(() => CartItem, (item) => item.cart, {
    cascade: true,
  })
  items?: CartItem[];

  @UpdateDateColumn()
  updatedAt!: Date;
}
