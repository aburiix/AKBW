/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `Admins` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Admins" ADD COLUMN     "refreshToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Admins_refreshToken_key" ON "Admins"("refreshToken");
