/*
  Warnings:

  - The values [IMPORT] on the enum `FulfillmentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FulfillmentType_new" AS ENUM ('SELF', 'FACTORY');
ALTER TABLE "Products" ALTER COLUMN "type" TYPE "FulfillmentType_new" USING ("type"::text::"FulfillmentType_new");
ALTER TABLE "Shipment" ALTER COLUMN "type" TYPE "FulfillmentType_new" USING ("type"::text::"FulfillmentType_new");
ALTER TYPE "FulfillmentType" RENAME TO "FulfillmentType_old";
ALTER TYPE "FulfillmentType_new" RENAME TO "FulfillmentType";
DROP TYPE "public"."FulfillmentType_old";
COMMIT;
