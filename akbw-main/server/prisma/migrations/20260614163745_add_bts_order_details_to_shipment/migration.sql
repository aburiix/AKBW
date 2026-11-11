-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "btsOrderCost" INTEGER,
ADD COLUMN     "btsOrderData" JSONB,
ADD COLUMN     "btsOrderStatus" TEXT;
