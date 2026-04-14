import { Test, TestingModule } from '@nestjs/testing';
import { AUDIT_LOG_REPOSITORY } from './audit-log.repository';
import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  const auditLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findPaginated: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: AUDIT_LOG_REPOSITORY, useValue: auditLogRepository },
      ],
    }).compile();

    service = module.get(AuditLogService);
  });

  it('creates and saves an audit log entry', async () => {
    auditLogRepository.create.mockReturnValue({ id: 'audit-1' });
    auditLogRepository.save.mockResolvedValue({ id: 'audit-1' });

    await service.logAction('admin-1', 'CREATE_PRODUCT', 'Product', 'product-1');

    expect(auditLogRepository.create).toHaveBeenCalled();
    expect(auditLogRepository.save).toHaveBeenCalled();
  });

  it('returns paginated audit logs', async () => {
    auditLogRepository.findPaginated.mockResolvedValue([
      [
        {
          id: 'audit-1',
          action: 'CREATE_PRODUCT',
          affectedEntityType: 'Product',
          affectedEntityId: 'product-1',
          timestamp: new Date(),
          performedBy: {
            id: 'admin-1',
            email: 'admin@example.com',
            name: 'Admin',
          },
        },
      ],
      1,
    ]);

    const result = await service.getPaginatedAuditLogs(1, 10);

    expect(result.total).toBe(1);
    expect(result.items[0].performedBy.email).toBe('admin@example.com');
  });
});
