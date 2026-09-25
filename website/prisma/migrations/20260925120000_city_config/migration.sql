-- DropIndex
DROP INDEX "District_slug_key";

-- AlterTable
ALTER TABLE "City" ADD COLUMN     "currency" TEXT,
ADD COLUMN     "inPhrases" JSONB,
ADD COLUMN     "locales" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "timezone" TEXT;

