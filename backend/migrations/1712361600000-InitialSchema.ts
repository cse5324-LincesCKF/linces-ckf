import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1712361600000 implements MigrationInterface {
  name = 'InitialSchema1712361600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('CUSTOMER', 'BRAND_RETAILER', 'ADMINISTRATOR')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_languagePreference_enum" AS ENUM('EN', 'ES')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."quotes_status_enum" AS ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(120) NOT NULL,
        "email" character varying(255) NOT NULL,
        "passwordHash" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'CUSTOMER',
        "isActive" boolean NOT NULL DEFAULT true,
        "languagePreference" "public"."users_languagePreference_enum" NOT NULL DEFAULT 'EN',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(160) NOT NULL,
        "description" text NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "stockQuantity" integer NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "category" character varying(120) NOT NULL,
        "size" character varying(60),
        "color" character varying(60),
        "imageUrls" text array NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "carts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        CONSTRAINT "REL_carts_userId" UNIQUE ("userId"),
        CONSTRAINT "PK_carts_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quantity" integer NOT NULL,
        "cartId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        CONSTRAINT "PK_cart_items_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PENDING',
        "subtotal" numeric(10,2) NOT NULL,
        "tax" numeric(10,2) NOT NULL,
        "shippingFee" numeric(10,2) NOT NULL,
        "total" numeric(10,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quantity" integer NOT NULL,
        "priceAtPurchase" numeric(10,2) NOT NULL,
        "orderId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "quotes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quantity" integer NOT NULL,
        "materialType" character varying(120) NOT NULL,
        "desiredDeliveryDate" date NOT NULL,
        "customizationDescription" text NOT NULL,
        "supportingDocumentUrl" character varying,
        "status" "public"."quotes_status_enum" NOT NULL DEFAULT 'SUBMITTED',
        "convertedToOrderId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "submittedById" uuid NOT NULL,
        CONSTRAINT "PK_quotes_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "action" character varying(120) NOT NULL,
        "affectedEntityType" character varying(120) NOT NULL,
        "affectedEntityId" character varying(120) NOT NULL,
        "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
        "performedById" uuid NOT NULL,
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "carts"
      ADD CONSTRAINT "FK_carts_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "cart_items"
      ADD CONSTRAINT "FK_cart_items_cart"
      FOREIGN KEY ("cartId") REFERENCES "carts"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "cart_items"
      ADD CONSTRAINT "FK_cart_items_product"
      FOREIGN KEY ("productId") REFERENCES "products"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "order_items"
      ADD CONSTRAINT "FK_order_items_order"
      FOREIGN KEY ("orderId") REFERENCES "orders"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "order_items"
      ADD CONSTRAINT "FK_order_items_product"
      FOREIGN KEY ("productId") REFERENCES "products"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "quotes"
      ADD CONSTRAINT "FK_quotes_user"
      FOREIGN KEY ("submittedById") REFERENCES "users"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "audit_logs"
      ADD CONSTRAINT "FK_audit_logs_user"
      FOREIGN KEY ("performedById") REFERENCES "users"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_logs_user"`);
    await queryRunner.query(`ALTER TABLE "quotes" DROP CONSTRAINT "FK_quotes_user"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_product"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_order"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_user"`);
    await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_product"`);
    await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_cart"`);
    await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_carts_user"`);

    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "quotes"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "users"`);

    await queryRunner.query(`DROP TYPE "public"."quotes_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_languagePreference_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
