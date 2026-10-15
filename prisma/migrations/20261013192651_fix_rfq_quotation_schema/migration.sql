/*
  Warnings:

  - You are about to drop the column `userId` on the `Quotation` table. All the data in the column will be lost.
  - The `status` column on the `Quotation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `price` on the `QuotationLineItem` table. All the data in the column will be lost.
  - The `status` column on the `RFQ` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `unitPrice` to the `QuotationLineItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `RFQ` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RfqStatus" AS ENUM ('DRAFT', 'OPEN', 'UNDER_REVIEW', 'AWARDED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_EVALUATION', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- DropForeignKey
ALTER TABLE "Quotation" DROP CONSTRAINT "Quotation_userId_fkey";

-- AlterTable
ALTER TABLE "Quotation" DROP COLUMN "userId",
ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
DROP COLUMN "status",
ADD COLUMN     "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "QuotationLineItem" DROP COLUMN "price",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "totalPrice" DECIMAL(12,2),
ADD COLUMN     "unitPrice" DECIMAL(12,2) NOT NULL;

-- AlterTable
ALTER TABLE "RFQ" ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
DROP COLUMN "status",
ADD COLUMN     "status" "RfqStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "File_uploadedBy_idx" ON "File"("uploadedBy");

-- CreateIndex
CREATE INDEX "Quotation_status_idx" ON "Quotation"("status");

-- CreateIndex
CREATE INDEX "QuotationLineItem_rfqLineItemId_idx" ON "QuotationLineItem"("rfqLineItemId");

-- CreateIndex
CREATE INDEX "QuotationRevision_changedBy_idx" ON "QuotationRevision"("changedBy");

-- CreateIndex
CREATE INDEX "RFQ_createdById_idx" ON "RFQ"("createdById");

-- CreateIndex
CREATE INDEX "RFQ_status_idx" ON "RFQ"("status");

-- CreateIndex
CREATE INDEX "RFQLineItem_rfqId_idx" ON "RFQLineItem"("rfqId");

-- AddForeignKey
ALTER TABLE "RFQ" ADD CONSTRAINT "RFQ_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
