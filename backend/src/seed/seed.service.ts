import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { USERS_REPOSITORY, IUsersRepository } from '../users/users.repository';
import { PRODUCTS_REPOSITORY, IProductsRepository } from '../products/products.repository';
import { UserRole } from '../common/constants/roles.constant';
import { LanguagePreference } from '../common/constants/language-preference.constant';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,

    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: IProductsRepository,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.ENABLE_SEED !== 'true') {
      this.logger.log('Seed disabled');
      return;
    }

    await this.seedUsers();
    await this.seedProducts();
  }

  private async seedUsers() {
    const count = await this.usersRepository.countAll();

    if (count > 0) {
      this.logger.log('Users already exist, skipping');
      return;
    }

    const password = await bcrypt.hash('Password123', 10);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        passwordHash: password,
        role: UserRole.ADMINISTRATOR,
        isActive: true,
        languagePreference: LanguagePreference.EN,
      },
      {
        name: 'Retailer User',
        email: 'retailer@test.com',
        passwordHash: password,
        role: UserRole.BRAND_RETAILER,
        isActive: true,
        languagePreference: LanguagePreference.EN,
      },
      {
        name: 'Customer User',
        email: 'customer@test.com',
        passwordHash: password,
        role: UserRole.CUSTOMER,
        isActive: true,
        languagePreference: LanguagePreference.EN,
      },
    ];

    for (const u of users) {
      const user = this.usersRepository.create(u);
      await this.usersRepository.save(user);
    }

    this.logger.log('Seed users created');
  }

  private async seedProducts() {
    const count = await this.productsRepository.countAll();

    if (count > 0) {
      this.logger.log('Products already exist, skipping');
      return;
    }

    const products = [
  {
    name_en: 'Luxury Silk Dress',
    name_es: 'Vestido de Seda de Lujo',
    description_en: 'Elegant silk dress suitable for formal occasions.',
    description_es: 'Vestido de seda elegante para ocasiones formales.',
    price: 899,
    stockQuantity: 10,
    category: 'Dress',
    size: 'M',
    color: 'Black',
    imageUrls: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400',
    ],
    isActive: true,
  },
  {
    name_en: 'Classic Formal Suit',
    name_es: 'Traje Formal Clásico',
    description_en: 'Professional suit designed for business environments.',
    description_es: 'Traje profesional diseñado para entornos de negocios.',
    price: 1200,
    stockQuantity: 5,
    category: 'Suit',
    size: 'L',
    color: 'Navy',
    imageUrls: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400',
    ],
    isActive: true,
  },
  {
    name_en: 'Casual Cotton Shirt',
    name_es: 'Camisa Casual de Algodón',
    description_en: 'Comfortable cotton shirt for daily wear.',
    description_es: 'Camisa de algodón cómoda para uso diario.',
    price: 120,
    stockQuantity: 0,
    category: 'Shirt',
    size: 'XL',
    color: 'White',
    imageUrls: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400',
    ],
    isActive: true,
  },
];

    for (const p of products) {
      const product = this.productsRepository.create(p);
      await this.productsRepository.save(product);
    }

    this.logger.log('Seed products created');
  }
}