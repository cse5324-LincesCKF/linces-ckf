import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, EntityManager } from 'typeorm';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CartItem } from '../cart/entities/cart-item.entity';
import { CART_REPOSITORY, ICartRepository } from '../cart/cart.repository';
import { AuditAction, AuditEntityType } from '../common/constants/audit.constants';
import { OrderStatus } from '../common/constants/order-status.constant';
import { UserRole } from '../common/constants/roles.constant';
import { NotificationService } from '../common/services/notification.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderItem } from './entities/order-item.entity';
import {
  IOrdersRepository,
  ORDERS_REPOSITORY,
} from './orders.repository';
import { Order } from './entities/order.entity';
import {
  IProductsRepository,
  PRODUCTS_REPOSITORY,
} from '../products/products.repository';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject(ORDERS_REPOSITORY)
    private readonly ordersRepository: IOrdersRepository,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: IProductsRepository,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createOrder(userId: string) {
    const order = await this.dataSource.transaction(async (manager) => {
      const cart = await this.cartRepository.findByUserId(userId, manager);

      if (!cart?.items?.length) {
        throw new BadRequestException('Cart is empty');
      }

      this.ensureStockAvailability(cart.items);
      const totals = this.calculateTotals(cart.items);
      const order = this.ordersRepository.create({
        user: { id: userId } as never,
        status: OrderStatus.PENDING,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shippingFee: totals.shippingFee,
        total: totals.total,
        items: cart.items.map((item) => this.toOrderItem(item)),
      });

      cart.items.forEach((item) => {
        item.product.stockQuantity -= item.quantity;
      });

      await this.productsRepository.saveMany(
        cart.items.map((item) => item.product),
        manager,
      );
      const savedOrder = await this.ordersRepository.save(order, manager);
      await this.cartRepository.clearItems(cart.id, manager);

      return savedOrder;
    });

    this.logger.log(`Simulated payment success for order ${order.id}`);
    this.notificationService.sendOrderConfirmation(userId, order.id);

    return this.toOrderResponse(order);
  }

  async getOrderById(requestUserId: string, requestRole: UserRole, orderId: string) {
    const order = await this.findOrderOrFail(orderId);

    if (requestRole !== UserRole.ADMINISTRATOR && order.user.id !== requestUserId) {
      throw new ForbiddenException('You can only access your own orders');
    }

    return this.toOrderResponse(order);
  }

  async getOrdersForUser(requestUserId: string, requestRole: UserRole, targetUserId: string) {
    if (requestRole !== UserRole.ADMINISTRATOR && requestUserId !== targetUserId) {
      throw new ForbiddenException('You can only access your own orders');
    }

    const orders = await this.ordersRepository.findByUserId(targetUserId);
    return orders.map((order) => this.toOrderResponse(order));
  }

  async updateStatus(adminId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOrderOrFail(orderId);
    order.status = dto.status;
    const savedOrder = await this.ordersRepository.save(order);

    await this.auditLogService.logAction(
      adminId,
      AuditAction.UPDATE_ORDER_STATUS,
      AuditEntityType.ORDER,
      savedOrder.id,
    );

    return this.toOrderResponse(savedOrder);
  }

  async createDraftOrderForQuote(userId: string, manager?: EntityManager) {
    const draftOrder = this.ordersRepository.create({
      user: { id: userId } as never,
      items: [],
      status: OrderStatus.PENDING,
      subtotal: 0,
      tax: 0,
      shippingFee: 0,
      total: 0,
    });

    return this.ordersRepository.save(draftOrder, manager);
  }

  async countOrders(): Promise<number> {
    return this.ordersRepository.countAll();
  }

  private async findOrderOrFail(orderId: string): Promise<Order> {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private ensureStockAvailability(items: CartItem[]): void {
    items.forEach((item) => {
      if (!item.product.isActive || item.product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Product ${item.product.name_en} / ${item.product.name_es} is out of stock for the requested quantity`,
        );
      }
    });
  }

  private calculateTotals(items: CartItem[]) {
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    const taxRate = Number(this.configService.get('TAX_RATE') ?? 0);
    const shippingFee = Number(this.configService.get('FLAT_SHIPPING_FEE') ?? 0);
    const tax = subtotal * taxRate;

    return {
      subtotal,
      tax,
      shippingFee,
      total: subtotal + tax + shippingFee,
    };
  }

  private toOrderItem(item: CartItem): OrderItem {
    return {
      product: item.product,
      quantity: item.quantity,
      priceAtPurchase: item.product.price,
    } as OrderItem;
  }

  private toOrderResponse(order: Order) {
    return {
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      shippingFee: order.shippingFee,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      userId: order.user.id,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        product: {
          id: item.product.id,
          name_en: item.product.name_en,
          name_es: item.product.name_es,
          imageUrls: item.product.imageUrls,
        },
      })),
    };
  }
}
