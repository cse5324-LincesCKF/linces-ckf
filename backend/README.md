# Linces'CKF Backend

NestJS backend for the Linces'CKF e-commerce and B2B quote platform.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Install

```bash
npm install
```

## Environment

1. Copy `.env.example` to `.env`
2. Update the database, JWT, CORS, and pricing values

## Run migrations

```bash
npm run migration:run
```

## Start the server

```bash
npm run start:dev
```

The API is exposed under `/api` and Swagger is available at `/api/docs`.

## Run tests

```bash
npm test
npm run test:cov
```

## Project notes

- Authentication uses JWT access tokens with Passport strategies
- Schema management uses TypeORM migrations
- Admin write actions are persisted to the audit log
- Checkout simulates payment processing and sends console-based notification placeholders
