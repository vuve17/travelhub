/*
  Warnings:

  - You are about to drop the `Itinerary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItinerarySegment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ItinerarySegment" DROP CONSTRAINT "ItinerarySegment_itineraryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ItinerarySegment" DROP CONSTRAINT "ItinerarySegment_routeId_fkey";

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "totalDurationMin" INTEGER;

-- DropTable
DROP TABLE "public"."Itinerary";

-- DropTable
DROP TABLE "public"."ItinerarySegment";
