import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';

export const CART_REPOSITORY = Symbol('CART_REPOSITORY');

export interface ICartRepository {
  createCart(data: Partial<Cart>): Cart;
  createItem(data: Partial<CartItem>): CartItem;
  saveCart(cart: Cart, manager?: EntityManager): Promise<Cart>;
  saveItem(item: CartItem, manager?: EntityManager): Promise<CartItem>;
  findByUserId(userId: string, manager?: EntityManager): Promise<Cart | null>;
  findItemById(itemId: string, manager?: EntityManager): Promise<CartItem | null>;
  removeItem(item: CartItem, manager?: EntityManager): Promise<void>;
  clearItems(cartId: string, manager?: EntityManager): Promise<void>;
}

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
  ) {}

  createCart(data: Partial<Cart>): Cart {
    return this.cartsRepository.create(data);
  }

  createItem(data: Partial<CartItem>): CartItem {
    return this.cartItemsRepository.create(data);
  }

  saveCart(cart: Cart, manager?: EntityManager): Promise<Cart> {
    return this.getCartRepository(manager).save(cart);
  }

  saveItem(item: CartItem, manager?: EntityManager): Promise<CartItem> {
    return this.getItemRepository(manager).save(item);
  }

  findByUserId(userId: string, manager?: EntityManager): Promise<Cart | null> {
    return this.getCartRepository(manager).findOne({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.product'],
    });
  }

  findItemById(itemId: string, manager?: EntityManager): Promise<CartItem | null> {
    return this.getItemRepository(manager).findOne({
      where: { id: itemId },
      relations: ['cart', 'cart.user', 'product'],
    });
  }

  async removeItem(item: CartItem, manager?: EntityManager): Promise<void> {
    await this.getItemRepository(manager).remove(item);
  }

  async clearItems(cartId: string, manager?: EntityManager): Promise<void> {
    const repository = this.getItemRepository(manager);
    const items = await repository.find({
      where: { cart: { id: cartId } },
      relations: ['cart'],
    });

    if (items.length) {
      await repository.remove(items);
    }
  }

  private getCartRepository(manager?: EntityManager): Repository<Cart> {
    return manager ? manager.getRepository(Cart) : this.cartsRepository;
  }

  private getItemRepository(manager?: EntityManager): Repository<CartItem> {
    return manager ? manager.getRepository(CartItem) : this.cartItemsRepository;
  }
}
