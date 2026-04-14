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

# Seed Data

This project supports automatic data generation for testing.

## Enable Seed

Set in `.env`:

```
ENABLE_SEED=true
```

Then start backend:

```
npm run start:dev
```

---

## Test Accounts

All accounts use the same password:

```
Password123
```

| Role     | Email                                         |
| -------- | --------------------------------------------- |
| Admin    | [admin@test.com](mailto:admin@test.com)       |
| Retailer | [retailer@test.com](mailto:retailer@test.com) |
| Customer | [customer@test.com](mailto:customer@test.com) |

---

## Notes

* Admin accounts cannot be registered manually.
* Data is only created if the database is empty.
* Restart backend after clearing database to regenerate data.
