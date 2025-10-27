/*
  Warnings:

  - Made the column `city` on table `Airport` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Airport" ALTER COLUMN "city" SET NOT NULL;
