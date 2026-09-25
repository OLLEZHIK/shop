-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "cityId" INTEGER;
-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
