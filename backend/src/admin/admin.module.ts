import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { QuotesModule } from '../quotes/quotes.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    AuditLogModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    QuotesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
