import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CART_REPOSITORY } from '../cart/cart.repository';
import { OrderStatus } from '../common/constants/order-status.constant';
import { UserRole } from '../common/constants/roles.constant';
import { NotificationService } from '../common/services/notification.service';
import { ORDERS_REPOSITORY } from './orders.repository';
import { OrdersService } from './orders.service';
import { PRODUCTS_REPOSITORY } from '../products/products.repository';

describe('OrdersService', () => {
  let service: OrdersService;
  const ordersRepository = {
    create: jest.fn(),
    save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    countAll: jest.fn(),
  };
  const cartRepository = {
    findByUserId: jest.fn(),
    clearItems: jest.fn(),
  };
  const productsRepository = {
    saveMany: jest.fn(),
  };
  const dataSource = {
    transaction: jest.fn(),
  };
  const configService = {
    get: jest.fn((key: string) => (key === 'TAX_RATE' ? '0.1' : '5')),
  };
  const notificationService = {
    sendOrderConfirmation: jest.fn(),
  };
  const auditLogService = {
    logAction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    dataSource.transaction.mockImplementation((callback: Function) => callback({}));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: ORDERS_REPOSITORY, useValue: ordersRepository },
        { provide: CART_REPOSITORY, useValue: cartRepository },
        { provide: PRODUCTS_REPOSITORY, useValue: productsRepository },
        { provide: DataSource, useValue: dataSource },
        { provide: ConfigService, useValue: configService },
        { provide: NotificationService, useValue: notificationService },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  it('creates an order from an in-stock cart', async () => {
    const cart = {
      id: 'cart-1',
      items: [
        {
          quantity: 2,
          product: {
            id: 'product-1',
            name: 'Silk Dress',
            isActive: true,
            stockQuantity: 5,
            price: 50,
            imageUrls: ['https://example.com/image.jpg'],
          },
        },
      ],
    };
    const savedOrder = {
      id: 'order-1',
      user: { id: 'user-1' },
      status: OrderStatus.PENDING,
      subtotal: 100,
      tax: 10,
      shippingFee: 5,
      total: 115,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'order-item-1',
          quantity: 2,
          priceAtPurchase: 50,
          product: cart.items[0].product,
        },
      ],
    };
    cartRepository.findByUserId.mockResolvedValue(cart);
    ordersRepository.create.mockReturnValue({});
    productsRepository.saveMany.mockResolvedValue([]);
    ordersRepository.save.mockResolvedValue(savedOrder);
    cartRepository.clearItems.mockResolvedValue(undefined);

    const result = await service.createOrder('user-1');

    expect(result.id).toBe('order-1');
    expect(productsRepository.saveMany).toHaveBeenCalled();
    expect(notificationService.sendOrderConfirmation).toHaveBeenCalledWith(
      'user-1',
      'order-1',
    );
  });

  it('rejects checkout when the cart is empty', async () => {
    cartRepository.findByUserId.mockResolvedValue({ id: 'cart-1', items: [] });

    await expect(service.createOrder('user-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('prevents non-admins from reading another user order', async () => {
    ordersRepository.findById.mockResolvedValue({
      id: 'order-1',
      user: { id: 'other-user' },
      items: [],
    });

    await expect(
      service.getOrderById('user-1', UserRole.CUSTOMER, 'order-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updates order status and writes an audit log', async () => {
    const order = {
      id: 'order-1',
      user: { id: 'user-1' },
      items: [],
      status: OrderStatus.PENDING,
    };
    ordersRepository.findById.mockResolvedValue(order);
    ordersRepository.save.mockImplementation((entity) =>
      Promise.resolve({
        subtotal: 0,
        tax: 0,
        shippingFee: 0,
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
        ...entity,
      }),
    );

    const result = await service.updateStatus('admin-1', 'order-1', {
      status: OrderStatus.CONFIRMED,
    });

    expect(result.status).toBe(OrderStatus.CONFIRMED);
    expect(auditLogService.logAction).toHaveBeenCalled();
  });

  it('rejects checkout when a cart item is out of stock', async () => {
    cartRepository.findByUserId.mockResolvedValue({
      id: 'cart-1',
      items: [
        {
          quantity: 2,
          product: {
            id: 'product-1',
            name: 'Silk Dress',
            isActive: true,
            stockQuantity: 1,
            price: 50,
            imageUrls: [],
          },
        },
      ],
    });

    await expect(service.createOrder('user-1')).rejects.toThrow(BadRequestException);
  });

  it('returns an order when the requester owns it', async () => {
    ordersRepository.findById.mockResolvedValue({
      id: 'order-1',
      user: { id: 'user-1' },
      status: OrderStatus.PENDING,
      subtotal: 100,
      tax: 10,
      shippingFee: 5,
      total: 115,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    });

    const result = await service.getOrderById(
      'user-1',
      UserRole.CUSTOMER,
      'order-1',
    );

    expect(result.id).toBe('order-1');
  });

  it('rejects viewing another user order history for non-admins', async () => {
    await expect(
      service.getOrdersForUser('user-1', UserRole.CUSTOMER, 'other-user'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws when updating the status of a missing order', async () => {
    ordersRepository.findById.mockResolvedValue(null);

    await expect(
      service.updateStatus('admin-1', 'missing-order', {
        status: OrderStatus.CONFIRMED,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('returns order history for the owner', async () => {
    ordersRepository.findByUserId.mockResolvedValue([
      {
        id: 'order-1',
        user: { id: 'user-1' },
        status: OrderStatus.PENDING,
        subtotal: 100,
        tax: 10,
        shippingFee: 5,
        total: 115,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      },
    ]);

    const result = await service.getOrdersForUser(
      'user-1',
      UserRole.CUSTOMER,
      'user-1',
    );

    expect(result).toHaveLength(1);
  });

  it('creates a draft order for an approved quote conversion', async () => {
    ordersRepository.create.mockReturnValue({ id: 'draft-order' });
    ordersRepository.save.mockResolvedValue({ id: 'draft-order' });

    const result = await service.createDraftOrderForQuote('user-1');

    expect(result.id).toBe('draft-order');
    expect(ordersRepository.save).toHaveBeenCalled();
  });

  it('returns the total order count', async () => {
    ordersRepository.countAll.mockResolvedValue(12);

    await expect(service.countOrders()).resolves.toBe(12);
  });
});
