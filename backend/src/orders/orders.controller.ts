import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants/roles.constant';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@ApiBearerAuth()
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create an order from the current cart' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  createOrder(
    @CurrentUser() user: CurrentUserData,
    @Body() _dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(user.userId);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Return a single order by id' })
  @ApiResponse({ status: 200, description: 'Order returned successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getOrderById(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.ordersService.getOrderById(user.userId, user.role as UserRole, id);
  }

  @Get('users/:id/orders')
  @ApiOperation({ summary: 'Return order history for a user' })
  @ApiResponse({ status: 200, description: 'Order history returned successfully' })
  getOrdersForUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.ordersService.getOrdersForUser(user.userId, user.role as UserRole, id);
  }

  @Patch('orders/:id/status')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Update an order status' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  updateOrderStatus(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(user.userId, id, dto);
  }
}
