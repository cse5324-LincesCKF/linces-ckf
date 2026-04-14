import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { User } from '../users/entities/user.entity';

export const AUDIT_LOG_REPOSITORY = Symbol('AUDIT_LOG_REPOSITORY');

export interface IAuditLogRepository {
  create(data: Partial<AuditLog>): AuditLog;
  save(auditLog: AuditLog, manager?: EntityManager): Promise<AuditLog>;
  findPaginated(page: number, limit: number): Promise<[AuditLog[], number]>;
}

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  create(data: Partial<AuditLog>): AuditLog {
    return this.repository.create(data);
  }

  save(auditLog: AuditLog, manager?: EntityManager): Promise<AuditLog> {
    return this.getRepository(manager).save(auditLog);
  }

  findPaginated(page: number, limit: number): Promise<[AuditLog[], number]> {
    return this.repository.findAndCount({
      relations: ['performedBy'],
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  private getRepository(manager?: EntityManager): Repository<AuditLog> {
    return manager ? manager.getRepository(AuditLog) : this.repository;
  }
}
