-- AlterEnum
BEGIN;
CREATE TYPE "QuotationStatus_new" AS ENUM ('SUBMITTED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED');
ALTER TABLE "public"."Quotation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Quotation" ALTER COLUMN "status" TYPE "QuotationStatus_new" USING ("status"::text::"QuotationStatus_new");
ALTER TYPE "QuotationStatus" RENAME TO "QuotationStatus_old";
ALTER TYPE "QuotationStatus_new" RENAME TO "QuotationStatus";
DROP TYPE "public"."QuotationStatus_old";
ALTER TABLE "Quotation" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RfqStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'AWARDED');
ALTER TABLE "public"."RFQ" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "RFQ" ALTER COLUMN "status" TYPE "RfqStatus_new" USING ("status"::text::"RfqStatus_new");
ALTER TYPE "RfqStatus" RENAME TO "RfqStatus_old";
ALTER TYPE "RfqStatus_new" RENAME TO "RfqStatus";
DROP TYPE "public"."RfqStatus_old";
ALTER TABLE "RFQ" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "Quotation" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
