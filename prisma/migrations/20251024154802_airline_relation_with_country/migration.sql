/*
  Warnings:

  - You are about to drop the column `baseCountry` on the `Airline` table. All the data in the column will be lost.
  - Added the required column `baseCountryId` to the `Airline` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Airline" DROP COLUMN "baseCountry",
ADD COLUMN     "baseCountryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Airline" ADD CONSTRAINT "Airline_baseCountryId_fkey" FOREIGN KEY ("baseCountryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
