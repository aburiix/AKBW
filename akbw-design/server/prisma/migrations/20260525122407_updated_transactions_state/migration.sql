/*
  Warnings:

  - The `state` column on the `Transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `addressId` on table `Orders` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_addressId_fkey";

-- AlterTable
ALTER TABLE "Orders" ALTER COLUMN "addressId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "state",
ADD COLUMN     "state" TEXT NOT NULL DEFAULT '1';

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Adresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
