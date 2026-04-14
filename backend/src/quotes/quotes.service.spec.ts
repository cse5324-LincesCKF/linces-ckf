import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditLogService } from '../audit-log/audit-log.service';
import { QuoteStatus } from '../common/constants/quote-status.constant';
import { UserRole } from '../common/constants/roles.constant';
import { OrdersService } from '../orders/orders.service';
import { QUOTES_REPOSITORY } from './quotes.repository';
import { QuotesService } from './quotes.service';

describe('QuotesService', () => {
  let service: QuotesService;
  const quotesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    countOpen: jest.fn(),
  };
  const dataSource = {
    transaction: jest.fn(),
  };
  const auditLogService = {
    logAction: jest.fn(),
  };
  const ordersService = {
    createDraftOrderForQuote: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    dataSource.transaction.mockImplementation(
        (callback: (manager: any) => unknown) => callback({})
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotesService,
        { provide: QUOTES_REPOSITORY, useValue: quotesRepository },
        { provide: DataSource, useValue: dataSource },
        { provide: AuditLogService, useValue: auditLogService },
        { provide: OrdersService, useValue: ordersService },
      ],
    }).compile();

    service = module.get(QuotesService);
  });

  it('creates a quote for a brand retailer', async () => {
    const quote = {
      id: 'quote-1',
      submittedBy: { id: 'user-1', email: 'retailer@example.com', name: 'Retailer' },
      quantity: 100,
      materialType: 'Silk',
      desiredDeliveryDate: '2026-12-01',
      customizationDescription: 'Custom embroidery',
      supportingDocumentUrl: null,
      status: QuoteStatus.SUBMITTED,
      convertedToOrderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    quotesRepository.create.mockReturnValue(quote);
    quotesRepository.save.mockResolvedValue(quote);

    const result = await service.createQuote(
      {
        userId: 'user-1',
        email: 'retailer@example.com',
        role: UserRole.BRAND_RETAILER,
      },
      {
        quantity: 100,
        materialType: 'Silk',
        desiredDeliveryDate: '2026-12-01',
        customizationDescription: 'Custom embroidery',
      },
    );

    expect(result.id).toBe('quote-1');
  });

  it('rejects quote submission by non-retailers', async () => {
    await expect(
      service.createQuote(
        {
          userId: 'user-1',
          email: 'customer@example.com',
          role: UserRole.CUSTOMER,
        },
        {
          quantity: 100,
          materialType: 'Silk',
          desiredDeliveryDate: '2026-12-01',
          customizationDescription: 'Custom embroidery',
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns all quotes to an administrator', async () => {
    quotesRepository.findAll.mockResolvedValue([
      {
        id: 'quote-1',
        submittedBy: { id: 'user-1', email: 'retailer@example.com', name: 'Retailer' },
        quantity: 1,
        materialType: 'Silk',
        desiredDeliveryDate: '2026-12-01',
        customizationDescription: 'Custom',
        supportingDocumentUrl: null,
        status: QuoteStatus.SUBMITTED,
        convertedToOrderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.getQuotes({
      userId: 'admin-1',
      email: 'admin@example.com',
      role: UserRole.ADMINISTRATOR,
    });

    expect(result).toHaveLength(1);
    expect(quotesRepository.findAll).toHaveBeenCalled();
  });

  it('updates a quote status and writes an audit log', async () => {
    const quote = {
      id: 'quote-1',
      submittedBy: { id: 'user-1', email: 'retailer@example.com', name: 'Retailer' },
      quantity: 1,
      materialType: 'Silk',
      desiredDeliveryDate: '2026-12-01',
      customizationDescription: 'Custom',
      supportingDocumentUrl: null,
      status: QuoteStatus.SUBMITTED,
      convertedToOrderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    quotesRepository.findById.mockResolvedValue(quote);
    quotesRepository.save.mockResolvedValue({
      ...quote,
      status: QuoteStatus.APPROVED,
    });

    const result = await service.updateStatus('admin-1', 'quote-1', {
      status: QuoteStatus.APPROVED,
    });

    expect(result.status).toBe(QuoteStatus.APPROVED);
    expect(auditLogService.logAction).toHaveBeenCalled();
  });

  it('returns a quote when accessed by its owner', async () => {
    quotesRepository.findById.mockResolvedValue({
      id: 'quote-1',
      submittedBy: { id: 'user-1', email: 'retailer@example.com', name: 'Retailer' },
      quantity: 1,
      materialType: 'Silk',
      desiredDeliveryDate: '2026-12-01',
      customizationDescription: 'Custom',
      supportingDocumentUrl: null,
      status: QuoteStatus.SUBMITTED,
      convertedToOrderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.getQuoteById(
      {
        userId: 'user-1',
        email: 'retailer@example.com',
        role: UserRole.BRAND_RETAILER,
      },
      'quote-1',
    );

    expect(result.id).toBe('quote-1');
  });

  it('rejects conversion for non-approved quotes', async () => {
    quotesRepository.findById.mockResolvedValue({
      id: 'quote-1',
      submittedBy: { id: 'user-1' },
      status: QuoteStatus.SUBMITTED,
      convertedToOrderId: null,
    });

    await expect(
      service.convertQuote(
        {
          userId: 'user-1',
          email: 'retailer@example.com',
          role: UserRole.BRAND_RETAILER,
        },
        'quote-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('prevents a retailer from viewing another retailer quote', async () => {
    quotesRepository.findById.mockResolvedValue({
      id: 'quote-1',
      submittedBy: { id: 'owner-1' },
      quantity: 1,
      materialType: 'Silk',
      desiredDeliveryDate: '2026-12-01',
      customizationDescription: 'Custom',
      supportingDocumentUrl: null,
      status: QuoteStatus.SUBMITTED,
      convertedToOrderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.getQuoteById(
        {
          userId: 'other-user',
          email: 'retailer@example.com',
          role: UserRole.BRAND_RETAILER,
        },
        'quote-1',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('prevents converting a quote owned by a different retailer', async () => {
    quotesRepository.findById.mockResolvedValue({
      id: 'quote-1',
      submittedBy: { id: 'owner-1' },
      status: QuoteStatus.APPROVED,
      convertedToOrderId: null,
    });

    await expect(
      service.convertQuote(
        {
          userId: 'user-1',
          email: 'retailer@example.com',
          role: UserRole.BRAND_RETAILER,
        },
        'quote-1',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects conversion when a quote has already been converted', async () => {
    quotesRepository.findById.mockResolvedValue({
      id: 'quote-1',
      submittedBy: { id: 'user-1' },
      status: QuoteStatus.APPROVED,
      convertedToOrderId: 'order-1',
    });

    await expect(
      service.convertQuote(
        {
          userId: 'user-1',
          email: 'retailer@example.com',
          role: UserRole.BRAND_RETAILER,
        },
        'quote-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('converts an approved quote into a draft order', async () => {
    quotesRepository.findById.mockResolvedValue({
      id: 'quote-1',
      submittedBy: { id: 'user-1', email: 'retailer@example.com', name: 'Retailer' },
      quantity: 1,
      materialType: 'Silk',
      desiredDeliveryDate: '2026-12-01',
      customizationDescription: 'Custom',
      supportingDocumentUrl: null,
      status: QuoteStatus.APPROVED,
      convertedToOrderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    ordersService.createDraftOrderForQuote.mockResolvedValue({ id: 'order-1' });
    quotesRepository.save.mockImplementation(async (quote: any) => quote);

    const result = await service.convertQuote(
      {
        userId: 'user-1',
        email: 'retailer@example.com',
        role: UserRole.BRAND_RETAILER,
      },
      'quote-1',
    );

    expect(result.orderId).toBe('order-1');
  });

  it('throws when requesting a quote that does not exist', async () => {
    quotesRepository.findById.mockResolvedValue(null);

    await expect(
      service.getQuoteById(
        {
          userId: 'user-1',
          email: 'retailer@example.com',
          role: UserRole.BRAND_RETAILER,
        },
        'missing-quote',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('returns the count of open quotes', async () => {
    quotesRepository.countOpen.mockResolvedValue(3);

    await expect(service.countOpenQuotes()).resolves.toBe(3);
  });
});
