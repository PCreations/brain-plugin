/*
  Warnings:

  - Added the required column `back` to the `flashcards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `front` to the `flashcards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "flashcards" ADD COLUMN     "back" TEXT NOT NULL,
ADD COLUMN     "front" TEXT NOT NULL;
