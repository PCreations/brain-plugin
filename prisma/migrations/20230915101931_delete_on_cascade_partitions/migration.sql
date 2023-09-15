-- DropForeignKey
ALTER TABLE "Partition" DROP CONSTRAINT "Partition_boxId_fkey";

-- AddForeignKey
ALTER TABLE "Partition" ADD CONSTRAINT "Partition_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE CASCADE ON UPDATE CASCADE;
