import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction, AuditEntityType } from '../common/constants/audit.constants';
import { QuoteStatus } from '../common/constants/quote-status.constant';
import { UserRole } from '../common/constants/roles.constant';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
import { OrdersService } from '../orders/orders.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';
import {
  IQuotesRepository,
  QUOTES_REPOSITORY,
} from './quotes.repository';
import { Quote } from './entities/quote.entity';

@Injectable()
export class QuotesService {
  constructor(
    @Inject(QUOTES_REPOSITORY)
    private readonly quotesRepository: IQuotesRepository,
    private readonly dataSource: DataSource,
    private readonly auditLogService: AuditLogService,
    private readonly ordersService: OrdersService,
  ) {}

  async createQuote(user: CurrentUserData, dto: CreateQuoteDto) {
    if (user.role !== UserRole.BRAND_RETAILER) {
      throw new ForbiddenException('Only brand retailers can submit quotes');
    }

    const quote = await this.dataSource.transaction(async (manager) => {
      const quote = this.quotesRepository.create({
        ...dto,
        submittedBy: { id: user.userId } as never,
        supportingDocumentUrl: dto.supportingDocumentUrl ?? null,
        status: QuoteStatus.SUBMITTED,
      });

      return this.quotesRepository.save(quote, manager);
    });

    return this.toResponse(quote);
  }

  async getQuotes(user: CurrentUserData) {
    const quotes =
      user.role === UserRole.ADMINISTRATOR
        ? await this.quotesRepository.findAll()
        : await this.quotesRepository.findByUserId(user.userId);

    return quotes.map((quote) => this.toResponse(quote));
  }

  async getQuoteById(user: CurrentUserData, quoteId: string) {
    const quote = await this.findQuoteOrFail(quoteId);

    if (
      user.role !== UserRole.ADMINISTRATOR &&
      quote.submittedBy.id !== user.userId
    ) {
      throw new ForbiddenException('You can only access your own quotes');
    }

    return this.toResponse(quote);
  }

  async updateStatus(adminId: string, quoteId: string, dto: UpdateQuoteStatusDto) {
    const quote = await this.findQuoteOrFail(quoteId);
    quote.status = dto.status;
    const savedQuote = await this.quotesRepository.save(quote);

    await this.auditLogService.logAction(
      adminId,
      AuditAction.UPDATE_QUOTE_STATUS,
      AuditEntityType.QUOTE,
      savedQuote.id,
    );

    return this.toResponse(savedQuote);
  }

  async convertQuote(user: CurrentUserData, quoteId: string) {
    const quote = await this.findQuoteOrFail(quoteId);

    if (quote.submittedBy.id !== user.userId) {
      throw new ForbiddenException('You can only convert your own quotes');
    }

    if (quote.status !== QuoteStatus.APPROVED) {
      throw new BadRequestException('Only approved quotes can be converted');
    }

    if (quote.convertedToOrderId) {
      throw new BadRequestException('Quote has already been converted');
    }

    const savedQuote = await this.dataSource.transaction(async (manager) => {
      const order = await this.ordersService.createDraftOrderForQuote(
        user.userId,
        manager,
      );
      quote.convertedToOrderId = order.id;
      return this.quotesRepository.save(quote, manager);
    });

    return {
      quote: this.toResponse(savedQuote),
      orderId: savedQuote.convertedToOrderId,
      message: 'Approved quote converted into a draft order',
    };
  }

  async countOpenQuotes(): Promise<number> {
    return this.quotesRepository.countOpen();
  }

  private async findQuoteOrFail(quoteId: string): Promise<Quote> {
    const quote = await this.quotesRepository.findById(quoteId);

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    return quote;
  }

  private toResponse(quote: Quote) {
    return {
      id: quote.id,
      submittedBy: {
        id: quote.submittedBy.id,
        email: quote.submittedBy.email,
        name: quote.submittedBy.name,
      },
      quantity: quote.quantity,
      materialType: quote.materialType,
      desiredDeliveryDate: quote.desiredDeliveryDate,
      customizationDescription: quote.customizationDescription,
      supportingDocumentUrl: quote.supportingDocumentUrl,
      status: quote.status,
      convertedToOrderId: quote.convertedToOrderId,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    };
  }
}
