import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { QuoteStatus } from '../common/constants/quote-status.constant';
import { Quote } from './entities/quote.entity';

export const QUOTES_REPOSITORY = Symbol('QUOTES_REPOSITORY');

export interface IQuotesRepository {
  create(data: Partial<Quote>): Quote;
  save(quote: Quote, manager?: EntityManager): Promise<Quote>;
  findAll(): Promise<Quote[]>;
  findById(id: string): Promise<Quote | null>;
  findByUserId(userId: string): Promise<Quote[]>;
  countOpen(): Promise<number>;
}

@Injectable()
export class QuotesRepository implements IQuotesRepository {
  constructor(
    @InjectRepository(Quote)
    private readonly repository: Repository<Quote>,
  ) {}

  create(data: Partial<Quote>): Quote {
    return this.repository.create(data);
  }

  save(quote: Quote, manager?: EntityManager): Promise<Quote> {
    return this.getRepository(manager).save(quote);
  }

  findAll(): Promise<Quote[]> {
    return this.repository.find({
      relations: ['submittedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string): Promise<Quote | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['submittedBy'],
    });
  }

  findByUserId(userId: string): Promise<Quote[]> {
    return this.repository.find({
      where: { submittedBy: { id: userId } },
      relations: ['submittedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  countOpen(): Promise<number> {
    return this.repository.count({
      where: {
        status: In([QuoteStatus.SUBMITTED, QuoteStatus.UNDER_REVIEW]),
      },
    });
  }

  private getRepository(manager?: EntityManager): Repository<Quote> {
    return manager ? manager.getRepository(Quote) : this.repository;
  }
}
