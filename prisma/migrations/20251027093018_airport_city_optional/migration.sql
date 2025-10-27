-- AlterTable
ALTER TABLE "Airport" ADD COLUMN     "city" TEXT;

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "totalDurationMin" INTEGER,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItinerarySegment" (
    "itineraryId" INTEGER NOT NULL,
    "routeId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ItinerarySegment_pkey" PRIMARY KEY ("itineraryId","order")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItinerarySegment_itineraryId_routeId_order_key" ON "ItinerarySegment"("itineraryId", "routeId", "order");

-- AddForeignKey
ALTER TABLE "ItinerarySegment" ADD CONSTRAINT "ItinerarySegment_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItinerarySegment" ADD CONSTRAINT "ItinerarySegment_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
