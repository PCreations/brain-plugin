/*
  Warnings:

  - The primary key for the `flashcards` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "flashcards" DROP CONSTRAINT "flashcards_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id");
