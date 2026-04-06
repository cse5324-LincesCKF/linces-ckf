import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { DeactivateUserDto } from './dto/deactivate-user.dto';
import { UserRole } from '../common/constants/roles.constant';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.ADMINISTRATOR)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Return summary metrics for the admin dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard returned successfully' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Return all products with stock visibility' })
  @ApiResponse({ status: 200, description: 'Inventory returned successfully' })
  getInventory() {
    return this.adminService.getInventory();
  }

  @Get('users')
  @ApiOperation({ summary: 'Return all user accounts for admins' })
  @ApiResponse({ status: 200, description: 'Users returned successfully' })
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user account' })
  @ApiBody({ type: DeactivateUserDto })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  deactivateUser(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: DeactivateUserDto,
  ) {
    return this.adminService.deactivateUser(user.userId, id, dto);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Return paginated audit log entries' })
  @ApiResponse({ status: 200, description: 'Audit logs returned successfully' })
  getAuditLogs(@Query() query: PaginationQueryDto) {
    return this.adminService.getAuditLogs(query);
  }
}
