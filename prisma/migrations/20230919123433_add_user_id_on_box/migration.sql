/*
  Warnings:

  - Added the required column `userId` to the `Box` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Box" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'legacy-user-id';
