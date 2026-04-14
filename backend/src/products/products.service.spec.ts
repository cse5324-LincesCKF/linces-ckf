import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PRODUCTS_REPOSITORY } from './products.repository';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  const productsRepository = {
    findCatalog: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAll: jest.fn(),
    countAll: jest.fn(),
  };
  const auditLogService = {
    logAction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PRODUCTS_REPOSITORY, useValue: productsRepository },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('returns filtered catalog products', async () => {
    productsRepository.findCatalog.mockResolvedValue([
      {
        id: 'product-1',
        name: 'Silk Dress',
        description: 'Premium silk',
        price: 100,
        stockQuantity: 2,
        isActive: true,
        category: 'Dresses',
        size: 'M',
        color: 'Ivory',
        imageUrls: ['https://example.com/image.jpg'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.getProducts({ category: 'Dresses' });

    expect(result).toHaveLength(1);
    expect(result[0].stockStatus).toBe('IN_STOCK');
  });

  it('throws when a product is missing', async () => {
    productsRepository.findById.mockResolvedValue(null);

    await expect(service.getProductById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates a product and writes an audit log', async () => {
    const product = {
      id: 'product-1',
      name: 'Silk Dress',
      description: 'Premium silk',
      price: 100,
      stockQuantity: 5,
      isActive: true,
      category: 'Dresses',
      size: null,
      color: null,
      imageUrls: ['https://example.com/image.jpg'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    productsRepository.create.mockReturnValue(product);
    productsRepository.save.mockResolvedValue(product);

    const result = await service.createProduct('admin-1', {
      name: 'Silk Dress',
      description: 'Premium silk',
      price: 100,
      stockQuantity: 5,
      category: 'Dresses',
      imageUrls: ['https://example.com/image.jpg'],
    });

    expect(result.id).toBe('product-1');
    expect(auditLogService.logAction).toHaveBeenCalled();
  });

  it('rejects negative inventory updates', async () => {
    await expect(
      service.updateInventory('admin-1', 'product-1', { stockQuantity: -1 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('soft deletes a product', async () => {
    const product = {
      id: 'product-1',
      name: 'Silk Dress',
      description: 'Premium silk',
      price: 100,
      stockQuantity: 5,
      isActive: true,
      category: 'Dresses',
      size: null,
      color: null,
      imageUrls: ['https://example.com/image.jpg'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    productsRepository.findById.mockResolvedValue(product);
    productsRepository.save.mockResolvedValue({ ...product, isActive: false });

    const result = await service.deleteProduct('admin-1', 'product-1');

    expect(result.isActive).toBe(false);
    expect(auditLogService.logAction).toHaveBeenCalled();
  });

  it('returns inventory-focused product summaries', async () => {
    productsRepository.findAll.mockResolvedValue([
      {
        id: 'product-1',
        name: 'Silk Dress',
        stockQuantity: 5,
        isActive: true,
        category: 'Dresses',
        updatedAt: new Date(),
      },
    ]);

    const result = await service.getInventoryView();

    expect(result[0].stockQuantity).toBe(5);
  });
});
