import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CART_REPOSITORY,
  ICartRepository,
} from './cart.repository';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import {
  IProductsRepository,
  PRODUCTS_REPOSITORY,
} from '../products/products.repository';

@Injectable()
export class CartService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: IProductsRepository,
  ) {}

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return this.toCartResponse(cart);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.productsRepository.findById(dto.productId);

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    if (product.stockQuantity < dto.quantity) {
      throw new BadRequestException('Requested quantity exceeds available stock');
    }

    const existingItem = cart.items?.find((item) => item.product.id === dto.productId);
    if (existingItem) {
      if (product.stockQuantity < existingItem.quantity + dto.quantity) {
        throw new BadRequestException('Requested quantity exceeds available stock');
      }

      existingItem.quantity += dto.quantity;
      await this.cartRepository.saveItem(existingItem);
      return this.getCart(userId);
    }

    const item = this.cartRepository.createItem({
      cart,
      product,
      quantity: dto.quantity,
    });
    await this.cartRepository.saveItem(item);
    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.findItemForUserOrFail(userId, itemId);

    if (item.product.stockQuantity < dto.quantity) {
      throw new BadRequestException('Requested quantity exceeds available stock');
    }

    item.quantity = dto.quantity;
    await this.cartRepository.saveItem(item);
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.findItemForUserOrFail(userId, itemId);
    await this.cartRepository.removeItem(item);
    return this.getCart(userId);
  }

  private async getOrCreateCart(userId: string) {
    const existingCart = await this.cartRepository.findByUserId(userId);
    if (existingCart) {
      return existingCart;
    }

    const cart = this.cartRepository.createCart({
      user: { id: userId } as never,
      items: [],
    });

    return this.cartRepository.saveCart(cart);
  }

  private async findItemForUserOrFail(userId: string, itemId: string) {
    const item = await this.cartRepository.findItemById(itemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.cart.user.id !== userId) {
      throw new ForbiddenException('You can only manage your own cart');
    }

    return item;
  }

  private toCartResponse(cart: Awaited<ReturnType<CartService['getOrCreateCart']>>) {
    const items = cart.items ?? [];
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    return {
      id: cart.id,
      updatedAt: cart.updatedAt,
      items: items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          imageUrls: item.product.imageUrls,
          stockQuantity: item.product.stockQuantity,
        },
        lineTotal: item.product.price * item.quantity,
      })),
      totals: {
        subtotal,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      },
    };
  }
}
