/*
  Warnings:

  - You are about to drop the column `flashcard1Id` on the `Flashcard` table. All the data in the column will be lost.
  - You are about to drop the column `flashcard2Id` on the `Flashcard` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Flashcard" DROP CONSTRAINT "Flashcard_flashcard1Id_fkey";

-- DropForeignKey
ALTER TABLE "Flashcard" DROP CONSTRAINT "Flashcard_flashcard2Id_fkey";

-- DropIndex
DROP INDEX "Flashcard_flashcard1Id_key";

-- DropIndex
DROP INDEX "Flashcard_flashcard2Id_key";

-- AlterTable
ALTER TABLE "Flashcard" DROP COLUMN "flashcard1Id",
DROP COLUMN "flashcard2Id";

-- CreateTable
CREATE TABLE "_FlashcardConnectedTo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FlashcardConnectedTo_AB_unique" ON "_FlashcardConnectedTo"("A", "B");

-- CreateIndex
CREATE INDEX "_FlashcardConnectedTo_B_index" ON "_FlashcardConnectedTo"("B");

-- AddForeignKey
ALTER TABLE "_FlashcardConnectedTo" ADD CONSTRAINT "_FlashcardConnectedTo_A_fkey" FOREIGN KEY ("A") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FlashcardConnectedTo" ADD CONSTRAINT "_FlashcardConnectedTo_B_fkey" FOREIGN KEY ("B") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
