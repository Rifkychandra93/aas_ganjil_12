-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "expiredAt" TIMESTAMP(3),
ADD COLUMN     "paidAt" TIMESTAMP(3);
