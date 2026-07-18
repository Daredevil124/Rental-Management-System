-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'VENDOR';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "company_name" VARCHAR(255),
ADD COLUMN     "gst_no" VARCHAR(50),
ADD COLUMN     "product_category" VARCHAR(255);
