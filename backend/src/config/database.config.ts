import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const databaseConfig = registerAs('database', () => buildTypeOrmOptions());

export function buildTypeOrmOptions(): TypeOrmModuleOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseNumber(process.env.DB_PORT, 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'lincesckf',
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', '..', 'migrations', '*.{ts,js}')],
    synchronize: false,
    logging: !isProduction,
    migrationsRun: false,
  };
}
