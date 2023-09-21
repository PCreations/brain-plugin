import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaTrx } from './prisma.service';
import { BoxRepository } from '../model/box.repository';
import { Box, Partition } from '../model/box.entity';

@Injectable()
export class PostgresBoxRepository implements BoxRepository {
  constructor() {}

  getByUserId(userId: string) {
    return async (trx: PrismaTrx) => {
      const boxData = await trx.box.findFirstOrThrow({
        where: { userId },
        select: {
          id: true,
          userId: true,
          Partition: {
            select: {
              id: true,
            },
            orderBy: {
              partitionNumber: 'asc',
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
        boxData.userId,
      );
    };
  }

  getNextBoxId(): string {
    return uuidv4();
  }

  getById(boxId: string) {
    return async (trx: PrismaTrx) => {
      const boxData = await trx.box.findUniqueOrThrow({
        where: { id: boxId },
        select: {
          id: true,
          userId: true,
          Partition: {
            select: {
              id: true,
            },
            orderBy: {
              partitionNumber: 'asc',
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
        boxData.userId,
      );
    };
  }

  save(box: Box) {
    return async (trx: PrismaTrx) => {
      await trx.box.upsert({
        where: { id: box.id },
        update: { id: box.id },
        create: {
          id: box.id,
          userId: box.userId,
        },
      });
      await trx.partition.createMany({
        skipDuplicates: true,
        data: [
          {
            boxId: box.id,
            id: box.partitions[0].id,
            partitionNumber: 1,
          },
          {
            boxId: box.id,
            id: box.partitions[1].id,
            partitionNumber: 2,
          },
          {
            boxId: box.id,
            id: box.partitions[2].id,
            partitionNumber: 3,
          },
          {
            boxId: box.id,
            id: box.partitions[3].id,
            partitionNumber: 4,
          },
          {
            boxId: box.id,
            id: box.partitions[4].id,
            partitionNumber: 5,
          },
          {
            boxId: box.id,
            id: box.archivedPartition.id,
            partitionNumber: 6,
          },
        ],
      });
    };
  }
}
