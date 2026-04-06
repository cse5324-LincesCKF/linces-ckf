import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { UserRole } from '../common/constants/roles.constant';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('cart')
@ApiBearerAuth()
@Roles(UserRole.CUSTOMER)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Return the authenticated customer cart' })
  @ApiResponse({ status: 200, description: 'Cart returned successfully' })
  getCart(@CurrentUser() user: CurrentUserData) {
    return this.cartService.getCart(user.userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a product to the cart' })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  addItem(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(user.userId, dto);
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update a cart item quantity' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  updateItem(
    @CurrentUser() user: CurrentUserData,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.userId, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove a cart item' })
  @ApiResponse({ status: 200, description: 'Cart item removed successfully' })
  removeItem(
    @CurrentUser() user: CurrentUserData,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(user.userId, itemId);
  }
}
