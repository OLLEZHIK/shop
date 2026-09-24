-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "description" TEXT,
ADD COLUMN     "googleMapsUrl" TEXT,
ADD COLUMN     "googlePlaceId" TEXT,
ADD COLUMN     "googleRating" DOUBLE PRECISION,
ADD COLUMN     "googleRatingCount" INTEGER,
ADD COLUMN     "logoFile" TEXT,
ADD COLUMN     "ratingObservedAt" TIMESTAMP(3),
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "shortDescriptionLocal" TEXT;
