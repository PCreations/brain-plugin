/*
  Warnings:

  - Added the required column `partitionNumber` to the `Partition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Partition" ADD COLUMN     "partitionNumber" INTEGER NOT NULL;
