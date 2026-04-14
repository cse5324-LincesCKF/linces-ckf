import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CART_REPOSITORY } from './cart.repository';
import { CartService } from './cart.service';
import { PRODUCTS_REPOSITORY } from '../products/products.repository';

describe('CartService', () => {
  let service: CartService;
  const cartRepository = {
    findByUserId: jest.fn(),
    createCart: jest.fn(),
    saveCart: jest.fn(),
    createItem: jest.fn(),
    saveItem: jest.fn(),
    findItemById: jest.fn(),
    removeItem: jest.fn(),
  };
  const productsRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CART_REPOSITORY, useValue: cartRepository },
        { provide: PRODUCTS_REPOSITORY, useValue: productsRepository },
      ],
    }).compile();

    service = module.get(CartService);
  });

  it('creates an empty cart for a first-time customer', async () => {
    cartRepository.findByUserId.mockResolvedValueOnce(null);
    cartRepository.createCart.mockReturnValue({
      id: 'cart-1',
      user: { id: 'user-1' },
      items: [],
      updatedAt: new Date(),
    });
    cartRepository.saveCart.mockResolvedValue({
      id: 'cart-1',
      user: { id: 'user-1' },
      items: [],
      updatedAt: new Date(),
    });

    const result = await service.getCart('user-1');

    expect(result.id).toBe('cart-1');
    expect(result.totals.itemCount).toBe(0);
  });

  it('rejects adding a missing product', async () => {
    cartRepository.findByUserId.mockResolvedValue({
      id: 'cart-1',
      items: [],
      updatedAt: new Date(),
    });
    productsRepository.findById.mockResolvedValue(null);

    await expect(
      service.addItem('user-1', { productId: 'product-1', quantity: 1 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects adding an out-of-stock product', async () => {
    cartRepository.findByUserId.mockResolvedValue({
      id: 'cart-1',
      items: [],
      updatedAt: new Date(),
    });
    productsRepository.findById.mockResolvedValue({
      id: 'product-1',
      isActive: true,
      stockQuantity: 0,
    });

    await expect(
      service.addItem('user-1', { productId: 'product-1', quantity: 1 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects quantities above available stock when incrementing an item', async () => {
    cartRepository.findByUserId.mockResolvedValue({
      id: 'cart-1',
      items: [
        {
          id: 'item-1',
          quantity: 2,
          product: { id: 'product-1' },
        },
      ],
      updatedAt: new Date(),
    });
    productsRepository.findById.mockResolvedValue({
      id: 'product-1',
      isActive: true,
      stockQuantity: 3,
    });

    await expect(
      service.addItem('user-1', { productId: 'product-1', quantity: 2 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('adds a new cart item and returns the refreshed cart', async () => {
    const cart = {
      id: 'cart-1',
      items: [],
      updatedAt: new Date(),
    };
    const product = {
      id: 'product-1',
      name: 'Silk Dress',
      isActive: true,
      stockQuantity: 5,
      price: 120,
      imageUrls: ['https://example.com/image.jpg'],
    };
    const createdItem = {
      id: 'item-1',
      cart,
      product,
      quantity: 2,
    };

    cartRepository.findByUserId
      .mockResolvedValueOnce(cart)
      .mockResolvedValueOnce({
        ...cart,
        items: [createdItem],
      });
    productsRepository.findById.mockResolvedValue(product);
    cartRepository.createItem.mockReturnValue(createdItem);
    cartRepository.saveItem.mockResolvedValue(createdItem);

    const result = await service.addItem('user-1', {
      productId: 'product-1',
      quantity: 2,
    });

    expect(cartRepository.createItem).toHaveBeenCalledWith({
      cart,
      product,
      quantity: 2,
    });
    expect(result.totals.subtotal).toBe(240);
    expect(result.totals.itemCount).toBe(2);
  });

  it('prevents users from updating another cart item', async () => {
    cartRepository.findItemById.mockResolvedValue({
      id: 'item-1',
      cart: { user: { id: 'other-user' } },
      product: { stockQuantity: 5 },
    });

    await expect(
      service.updateItem('user-1', 'item-1', { quantity: 1 }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws when updating a missing cart item', async () => {
    cartRepository.findItemById.mockResolvedValue(null);

    await expect(
      service.updateItem('user-1', 'missing-item', { quantity: 1 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects updating a cart item beyond available stock', async () => {
    cartRepository.findItemById.mockResolvedValue({
      id: 'item-1',
      cart: { user: { id: 'user-1' } },
      product: { stockQuantity: 1 },
      quantity: 1,
    });

    await expect(
      service.updateItem('user-1', 'item-1', { quantity: 2 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates a cart item quantity and returns recalculated totals', async () => {
    cartRepository.findItemById.mockResolvedValue({
      id: 'item-1',
      cart: { user: { id: 'user-1' } },
      product: {
        id: 'product-1',
        name: 'Silk Dress',
        stockQuantity: 5,
        price: 80,
        imageUrls: [],
      },
      quantity: 1,
    });
    cartRepository.saveItem.mockResolvedValue(undefined);
    cartRepository.findByUserId.mockResolvedValue({
      id: 'cart-1',
      updatedAt: new Date(),
      items: [
        {
          id: 'item-1',
          quantity: 3,
          product: {
            id: 'product-1',
            name: 'Silk Dress',
            stockQuantity: 5,
            price: 80,
            imageUrls: [],
          },
        },
      ],
    });

    const result = await service.updateItem('user-1', 'item-1', { quantity: 3 });

    expect(cartRepository.saveItem).toHaveBeenCalled();
    expect(result.totals.subtotal).toBe(240);
    expect(result.totals.itemCount).toBe(3);
  });

  it('removes an item from the current user cart', async () => {
    cartRepository.findItemById.mockResolvedValue({
      id: 'item-1',
      cart: { user: { id: 'user-1' } },
      product: { stockQuantity: 5 },
    });
    cartRepository.removeItem.mockResolvedValue(undefined);
    cartRepository.findByUserId.mockResolvedValue({
      id: 'cart-1',
      items: [],
      updatedAt: new Date(),
    });

    const result = await service.removeItem('user-1', 'item-1');

    expect(cartRepository.removeItem).toHaveBeenCalled();
    expect(result.totals.itemCount).toBe(0);
  });

  it('throws when removing a missing cart item', async () => {
    cartRepository.findItemById.mockResolvedValue(null);

    await expect(
      service.removeItem('user-1', 'missing-item'),
    ).rejects.toThrow(NotFoundException);
  });
});
