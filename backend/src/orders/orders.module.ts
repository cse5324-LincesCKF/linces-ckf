import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { CartModule } from '../cart/cart.module';
import { NotificationService } from '../common/services/notification.service';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersRepository, ORDERS_REPOSITORY } from './orders.repository';
import { OrdersService } from './orders.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    CartModule,
    AuditLogModule,
    ProductsModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersRepository,
    NotificationService,
    {
      provide: ORDERS_REPOSITORY,
      useExisting: OrdersRepository,
    },
  ],
  exports: [OrdersService, ORDERS_REPOSITORY],
})
export class OrdersModule {}
