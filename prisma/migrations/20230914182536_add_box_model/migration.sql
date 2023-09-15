/*
  Warnings:

  - You are about to drop the `flashcards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "flashcards";

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "partitionId" INTEGER NOT NULL,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partition" (
    "id" SERIAL NOT NULL,
    "boxId" TEXT NOT NULL,

    CONSTRAINT "Partition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Box" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Box_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_partitionId_fkey" FOREIGN KEY ("partitionId") REFERENCES "Partition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partition" ADD CONSTRAINT "Partition_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
