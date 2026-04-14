import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import {
  AUDIT_LOG_REPOSITORY,
  AuditLogRepository,
} from './audit-log.repository';
import { AuditLogService } from './audit-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [
    AuditLogService,
    AuditLogRepository,
    {
      provide: AUDIT_LOG_REPOSITORY,
      useExisting: AuditLogRepository,
    },
  ],
  exports: [AuditLogService, AUDIT_LOG_REPOSITORY],
})
export class AuditLogModule {}
