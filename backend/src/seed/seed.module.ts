import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { SeedService } from './seed.service';

@Module({
  imports: [UsersModule, ProductsModule],
  providers: [SeedService],
})
export class SeedModule {}