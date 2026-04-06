import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuditLog } from '../../audit-log/entities/audit-log.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { Order } from '../../orders/entities/order.entity';
import { Quote } from '../../quotes/entities/quote.entity';
import { LanguagePreference } from '../../common/constants/language-preference.constant';
import { UserRole } from '../../common/constants/roles.constant';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @Column({
    type: 'enum',
    enum: LanguagePreference,
    default: LanguagePreference.EN,
  })
  languagePreference!: LanguagePreference;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart?: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders?: Order[];

  @OneToMany(() => Quote, (quote) => quote.submittedBy)
  quotes?: Quote[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.performedBy)
  auditLogs?: AuditLog[];
}
