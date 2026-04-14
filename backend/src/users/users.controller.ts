import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { EmptyBodyDto } from '../common/dto/empty-body.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: "Return the authenticated user's profile" })
  @ApiResponse({ status: 200, description: 'Profile returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: CurrentUserData) {
    return this.usersService.getProfile(user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update the authenticated user account' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(user.userId, id, dto);
  }

  @Put(':id/password')
  @ApiOperation({ summary: 'Update the authenticated user password' })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid password change request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  updatePassword(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usersService.changePassword(user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete the authenticated user account' })
  @ApiBody({ type: EmptyBodyDto })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  deleteUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.usersService.deleteUser(user.userId, id);
  }
}
