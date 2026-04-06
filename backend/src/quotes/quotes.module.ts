import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { OrdersModule } from '../orders/orders.module';
import { Quote } from './entities/quote.entity';
import { QuotesController } from './quotes.controller';
import { QuotesRepository, QUOTES_REPOSITORY } from './quotes.repository';
import { QuotesService } from './quotes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quote]), AuditLogModule, OrdersModule],
  controllers: [QuotesController],
  providers: [
    QuotesService,
    QuotesRepository,
    {
      provide: QUOTES_REPOSITORY,
      useExisting: QuotesRepository,
    },
  ],
  exports: [QuotesService, QUOTES_REPOSITORY],
})
export class QuotesModule {}
