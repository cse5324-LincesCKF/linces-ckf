import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  AUDIT_LOG_REPOSITORY,
  IAuditLogRepository,
} from './audit-log.repository';

@Injectable()
export class AuditLogService {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async logAction(
    performedById: string,
    action: string,
    affectedEntityType: string,
    affectedEntityId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      performedBy: { id: performedById } as never,
      action,
      affectedEntityType,
      affectedEntityId,
    });

    await this.auditLogRepository.save(auditLog, manager);
  }

  async getPaginatedAuditLogs(page: number, limit: number) {
    const [items, total] = await this.auditLogRepository.findPaginated(page, limit);

    return {
      items: items.map((item) => ({
        id: item.id,
        action: item.action,
        affectedEntityType: item.affectedEntityType,
        affectedEntityId: item.affectedEntityId,
        timestamp: item.timestamp,
        performedBy: {
          id: item.performedBy.id,
          email: item.performedBy.email,
          name: item.performedBy.name,
        },
      })),
      total,
      page,
      limit,
    };
  }
}
