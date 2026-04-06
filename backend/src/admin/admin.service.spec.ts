import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AdminService } from './admin.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { QuotesService } from '../quotes/quotes.service';
import { USERS_REPOSITORY } from '../users/users.repository';
import { UsersService } from '../users/users.service';

describe('AdminService', () => {
  let service: AdminService;
  const usersService = {
    countUsers: jest.fn(),
    getAdminVisibleUsers: jest.fn(),
  };
  const usersRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };
  const productsService = {
    countProducts: jest.fn(),
    getInventoryView: jest.fn(),
  };
  const ordersService = {
    countOrders: jest.fn(),
  };
  const quotesService = {
    countOpenQuotes: jest.fn(),
  };
  const auditLogService = {
    logAction: jest.fn(),
    getPaginatedAuditLogs: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: UsersService, useValue: usersService },
        { provide: USERS_REPOSITORY, useValue: usersRepository },
        { provide: ProductsService, useValue: productsService },
        { provide: OrdersService, useValue: ordersService },
        { provide: QuotesService, useValue: quotesService },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();

    service = module.get(AdminService);
  });

  it('returns dashboard summary counts', async () => {
    usersService.countUsers.mockResolvedValue(10);
    productsService.countProducts.mockResolvedValue(8);
    ordersService.countOrders.mockResolvedValue(4);
    quotesService.countOpenQuotes.mockResolvedValue(2);

    await expect(service.getDashboard()).resolves.toEqual({
      totalUsers: 10,
      totalProducts: 8,
      totalOrders: 4,
      openQuotes: 2,
    });
  });

  it('deactivates a user and writes an audit log', async () => {
    usersRepository.findById.mockResolvedValue({ id: 'user-1', isActive: true });
    usersRepository.save.mockResolvedValue({ id: 'user-1', isActive: false });

    const result = await service.deactivateUser('admin-1', 'user-1', {});

    expect(result.isActive).toBe(false);
    expect(auditLogService.logAction).toHaveBeenCalled();
  });

  it('throws when deactivating a missing user', async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(
      service.deactivateUser('admin-1', 'missing-user', {}),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns paginated audit logs', async () => {
    auditLogService.getPaginatedAuditLogs.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    await expect(service.getAuditLogs({ page: 1, limit: 10 })).resolves.toEqual({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
    });
  });

  it('returns admin inventory data', async () => {
    productsService.getInventoryView.mockResolvedValue([{ id: 'product-1' }]);

    await expect(service.getInventory()).resolves.toEqual([{ id: 'product-1' }]);
  });

  it('returns admin user lists', async () => {
    usersService.getAdminVisibleUsers.mockResolvedValue([{ id: 'user-1' }]);

    await expect(service.getUsers()).resolves.toEqual([{ id: 'user-1' }]);
  });
});
