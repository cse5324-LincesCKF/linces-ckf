import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuoteStatus } from '../../common/constants/quote-status.constant';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'quotes' })
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.quotes, { nullable: false, onDelete: 'RESTRICT' })
  submittedBy!: User;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ length: 120 })
  materialType!: string;

  @Column({ type: 'date' })
  desiredDeliveryDate!: string;

  @Column({ type: 'text' })
  customizationDescription!: string;

  @Column({ type: 'varchar', nullable: true })
  supportingDocumentUrl!: string | null;

  @Column({
    type: 'enum',
    enum: QuoteStatus,
    default: QuoteStatus.SUBMITTED,
  })
  status!: QuoteStatus;

  @Column({ type: 'uuid', nullable: true })
  convertedToOrderId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
