-- CreateTable
CREATE TABLE "SenderConfig" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "region_code" TEXT NOT NULL,
    "city_code" TEXT NOT NULL,
    "branch_code" TEXT NOT NULL,
    "lat_long" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SenderConfig_pkey" PRIMARY KEY ("id")
);
