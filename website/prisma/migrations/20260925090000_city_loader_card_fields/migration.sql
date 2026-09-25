-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "descriptionLocal" TEXT,
ADD COLUMN     "emergency247" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emergencyNote" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "homeVisits" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hoursObservedAt" TIMESTAMP(3),
ADD COLUMN     "hoursSourceUrl" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "languagesSpoken" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "City" ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PriceItem" ADD COLUMN     "weightFromKg" DOUBLE PRECISION,
ADD COLUMN     "weightToKg" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "category" "BusinessCategory",
ADD COLUMN     "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "District_cityId_slug_key" ON "District"("cityId", "slug");

