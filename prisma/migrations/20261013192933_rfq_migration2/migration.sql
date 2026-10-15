/*
  Warnings:

  - The values [UNDER_EVALUATION] on the enum `QuotationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [OPEN,UNDER_REVIEW] on the enum `RfqStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuotationStatus_new" AS ENUM ('DRAFT', 'SUBMITTED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
ALTER TABLE "public"."Quotation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Quotation" ALTER COLUMN "status" TYPE "QuotationStatus_new" USING ("status"::text::"QuotationStatus_new");
ALTER TYPE "QuotationStatus" RENAME TO "QuotationStatus_old";
ALTER TYPE "QuotationStatus_new" RENAME TO "QuotationStatus";
DROP TYPE "public"."QuotationStatus_old";
ALTER TABLE "Quotation" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RfqStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'AWARDED', 'CANCELLED');
ALTER TABLE "public"."RFQ" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "RFQ" ALTER COLUMN "status" TYPE "RfqStatus_new" USING ("status"::text::"RfqStatus_new");
ALTER TYPE "RfqStatus" RENAME TO "RfqStatus_old";
ALTER TYPE "RfqStatus_new" RENAME TO "RfqStatus";
DROP TYPE "public"."RfqStatus_old";
ALTER TABLE "RFQ" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;
