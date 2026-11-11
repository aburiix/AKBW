/*
  Warnings:

  - You are about to drop the column `btsOrderCost` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `btsOrderData` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `btsOrderStatus` on the `Shipment` table. All the data in the column will be lost.
  - Added the required column `password` to the `Admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actual_product_link` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admins" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "actual_product_link" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "actual_product_link" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Shipment" DROP COLUMN "btsOrderCost",
DROP COLUMN "btsOrderData",
DROP COLUMN "btsOrderStatus";
