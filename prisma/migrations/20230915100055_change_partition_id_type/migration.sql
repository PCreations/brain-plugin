/*
  Warnings:

  - The primary key for the `Partition` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Flashcard" DROP CONSTRAINT "Flashcard_partitionId_fkey";

-- AlterTable
ALTER TABLE "Flashcard" ALTER COLUMN "partitionId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Partition" DROP CONSTRAINT "Partition_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Partition_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Partition_id_seq";

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_partitionId_fkey" FOREIGN KEY ("partitionId") REFERENCES "Partition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
