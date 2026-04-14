import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: false, onDelete: 'RESTRICT' })
  performedBy!: User;

  @Column({ length: 120 })
  action!: string;

  @Column({ length: 120 })
  affectedEntityType!: string;

  @Column({ length: 120 })
  affectedEntityId!: string;

  @CreateDateColumn()
  timestamp!: Date;
}
