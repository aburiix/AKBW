/*
  Warnings:

  - The values [REVIEW,SENT] on the enum `OrderState` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `lat` on the `Adresses` table. All the data in the column will be lost.
  - You are about to drop the column `lon` on the `Adresses` table. All the data in the column will be lost.
  - You are about to drop the column `adress` on the `Factories` table. All the data in the column will be lost.
  - You are about to drop the column `bts_code` on the `Factories` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `factory_id` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `usedBonus` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the `UserBonus` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[order_id]` on the table `Transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `Factories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bts_branch_code` to the `Factories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bts_city_code` to the `Factories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bts_region_code` to the `Factories` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FulfillmentType" AS ENUM ('IMPORT', 'FACTORY');

-- CreateEnum
CREATE TYPE "OrderItemState" AS ENUM ('REVIEW', 'PENDING', 'SENT');

-- CreateEnum
CREATE TYPE "ShipmentState" AS ENUM ('PENDING', 'ORDERED_FROM_SUPPLIER', 'SUPPLIER_CONFIRMED', 'IN_TRANSIT', 'ARRIVED_UZBEKISTAN', 'IN_CUSTOMS', 'READY_FOR_BTS', 'SENT', 'DELIVERED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderState_new" AS ENUM ('PENDING', 'PAID', 'CANCELLED');
ALTER TABLE "public"."Orders" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Orders" ALTER COLUMN "state" TYPE "OrderState_new" USING ("state"::text::"OrderState_new");
ALTER TYPE "OrderState" RENAME TO "OrderState_old";
ALTER TYPE "OrderState_new" RENAME TO "OrderState";
DROP TYPE "public"."OrderState_old";
ALTER TABLE "Orders" ALTER COLUMN "state" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_factory_id_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_order_id_fkey";

-- DropForeignKey
ALTER TABLE "UserBonus" DROP CONSTRAINT "UserBonus_orderId_fkey";

-- DropForeignKey
ALTER TABLE "UserBonus" DROP CONSTRAINT "UserBonus_referrerId_fkey";

-- DropForeignKey
ALTER TABLE "UserBonus" DROP CONSTRAINT "UserBonus_userId_fkey";

-- AlterTable
ALTER TABLE "Adresses" DROP COLUMN "lat",
DROP COLUMN "lon";

-- AlterTable
ALTER TABLE "Factories" DROP COLUMN "adress",
DROP COLUMN "bts_code",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "bts_branch_code" TEXT NOT NULL,
ADD COLUMN     "bts_city_code" TEXT NOT NULL,
ADD COLUMN     "bts_region_code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "status",
ADD COLUMN     "shipmentId" INTEGER,
ADD COLUMN     "state" "OrderItemState" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "factory_id",
DROP COLUMN "usedBonus",
ADD COLUMN     "addressId" INTEGER,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "state" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "type",
ADD COLUMN     "type" "FulfillmentType" NOT NULL;

-- AlterTable
ALTER TABLE "Transactions" ALTER COLUMN "order_id" DROP NOT NULL;

-- DropTable
DROP TABLE "UserBonus";

-- DropEnum
DROP TYPE "ProductType";

-- CreateTable
CREATE TABLE "Shipment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "type" "FulfillmentType" NOT NULL,
    "factoryId" INTEGER,
    "sender_city_code" TEXT NOT NULL,
    "sender_region_code" TEXT NOT NULL,
    "sender_branch_code" TEXT NOT NULL,
    "receiver_city_code" TEXT NOT NULL,
    "receiver_branch_code" TEXT NOT NULL,
    "receiver_region_code" TEXT NOT NULL,
    "receiver_address" TEXT NOT NULL,
    "tracking_number" TEXT,
    "state" "ShipmentState" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_order_id_key" ON "Transactions"("order_id");

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Adresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
