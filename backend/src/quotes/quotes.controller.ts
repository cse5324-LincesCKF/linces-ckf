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
import { ConfirmationDto } from '../common/dto/confirmation.dto';
import { UserRole } from '../common/constants/roles.constant';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';
import { QuotesService } from './quotes.service';

@ApiTags('quotes')
@ApiBearerAuth()
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @Roles(UserRole.BRAND_RETAILER)
  @ApiOperation({ summary: 'Submit a manufacturing quote request' })
  @ApiBody({ type: CreateQuoteDto })
  @ApiResponse({ status: 201, description: 'Quote submitted successfully' })
  createQuote(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateQuoteDto,
  ) {
    return this.quotesService.createQuote(user, dto);
  }

  @Get()
  @Roles(UserRole.BRAND_RETAILER, UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Return quotes visible to the authenticated user' })
  @ApiResponse({ status: 200, description: 'Quotes returned successfully' })
  getQuotes(@CurrentUser() user: CurrentUserData) {
    return this.quotesService.getQuotes(user);
  }

  @Get(':id')
  @Roles(UserRole.BRAND_RETAILER, UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Return a quote by id' })
  @ApiResponse({ status: 200, description: 'Quote returned successfully' })
  getQuoteById(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    return this.quotesService.getQuoteById(user, id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Update a quote status' })
  @ApiBody({ type: UpdateQuoteStatusDto })
  @ApiResponse({ status: 200, description: 'Quote status updated successfully' })
  updateStatus(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateQuoteStatusDto,
  ) {
    return this.quotesService.updateStatus(user.userId, id, dto);
  }

  @Post(':id/convert')
  @Roles(UserRole.BRAND_RETAILER)
  @ApiOperation({ summary: 'Convert an approved quote into a draft order' })
  @ApiBody({ type: ConfirmationDto })
  @ApiResponse({ status: 201, description: 'Quote converted successfully' })
  convertQuote(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() _dto: ConfirmationDto,
  ) {
    return this.quotesService.convertQuote(user, id);
  }
}
