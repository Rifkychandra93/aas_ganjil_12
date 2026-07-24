/*
  Warnings:

  - A unique constraint covering the columns `[ticketCode]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paymentMethod` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketCode` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TRANSFER', 'EWALLET');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "ticketCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_ticketCode_key" ON "Order"("ticketCode");
