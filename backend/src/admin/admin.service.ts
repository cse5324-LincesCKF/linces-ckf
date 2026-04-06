import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { DeactivateUserDto } from './dto/deactivate-user.dto';
import { AuditAction, AuditEntityType } from '../common/constants/audit.constants';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { QuotesService } from '../quotes/quotes.service';
import {
  IUsersRepository,
  USERS_REPOSITORY,
} from '../users/users.repository';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly quotesService: QuotesService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getDashboard() {
    const [totalUsers, totalProducts, totalOrders, openQuotes] = await Promise.all([
      this.usersService.countUsers(),
      this.productsService.countProducts(),
      this.ordersService.countOrders(),
      this.quotesService.countOpenQuotes(),
    ]);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      openQuotes,
    };
  }

  getInventory() {
    return this.productsService.getInventoryView();
  }

  getUsers() {
    return this.usersService.getAdminVisibleUsers();
  }

  async deactivateUser(adminId: string, userId: string, _dto: DeactivateUserDto) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = false;
    await this.usersRepository.save(user);
    await this.auditLogService.logAction(
      adminId,
      AuditAction.DEACTIVATE_USER,
      AuditEntityType.USER,
      user.id,
    );

    return {
      id: user.id,
      isActive: user.isActive,
      message: 'User deactivated successfully',
    };
  }

  getAuditLogs(query: PaginationQueryDto) {
    return this.auditLogService.getPaginatedAuditLogs(query.page, query.limit);
  }
}
