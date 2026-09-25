-- AlterTable
ALTER TABLE "PriceItem" ADD COLUMN     "note" TEXT,
ADD COLUMN     "noteLocal" TEXT,
ADD COLUMN     "partial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unit" TEXT;
