/*
  Warnings:

  - A unique constraint covering the columns `[flashcard1Id]` on the table `Flashcard` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[flashcard2Id]` on the table `Flashcard` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN     "flashcard1Id" TEXT,
ADD COLUMN     "flashcard2Id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Flashcard_flashcard1Id_key" ON "Flashcard"("flashcard1Id");

-- CreateIndex
CREATE UNIQUE INDEX "Flashcard_flashcard2Id_key" ON "Flashcard"("flashcard2Id");

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_flashcard1Id_fkey" FOREIGN KEY ("flashcard1Id") REFERENCES "Flashcard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_flashcard2Id_fkey" FOREIGN KEY ("flashcard2Id") REFERENCES "Flashcard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
