import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { BoxRepository } from '../model/box.repository';
import { Box, Partition } from '../model/box.entity';

@Injectable()
export class PostgresBoxRepository implements BoxRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getById(boxId: string): Promise<Box> {
    const boxData = await this.prisma.box.findUnique({
      where: { id: boxId },
      select: {
        id: true,
        Partition: {
          select: {
            id: true,
          },
        },
      },
    });

    return new Box(
      boxData.id,
      [
        new Partition(boxData.Partition[0].id),
        new Partition(boxData.Partition[1].id),
        new Partition(boxData.Partition[2].id),
        new Partition(boxData.Partition[3].id),
        new Partition(boxData.Partition[4].id),
      ],
      new Partition(boxData.Partition[5].id),
    );
  }

  async save(box: Box): Promise<void> {
    await this.prisma.box.upsert({
      where: { id: box.id },
      update: { id: box.id },
      create: {
        id: box.id,
      },
    });
    await this.prisma.partition.createMany({
      skipDuplicates: true,
      data: [
        {
          boxId: box.id,
          id: box.partitions[0].id,
        },
        {
          boxId: box.id,
          id: box.partitions[1].id,
        },
        {
          boxId: box.id,
          id: box.partitions[2].id,
        },
        {
          boxId: box.id,
          id: box.partitions[3].id,
        },
        {
          boxId: box.id,
          id: box.partitions[4].id,
        },
        {
          boxId: box.id,
          id: box.archivedPartition.id,
        },
      ],
    });
  }
}
