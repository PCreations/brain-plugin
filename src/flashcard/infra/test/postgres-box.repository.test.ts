import { PostgresBoxRepository } from '../postgres-box.repository';
import { Box } from 'src/flashcard/model/box.entity';
import { createTestEnv } from 'src/test.env';

describe('PostgresBoxRepository', () => {
  const testEnv = createTestEnv();
  beforeAll(async () => {
    await testEnv.setUp();
  });

  afterAll(async () => {
    await testEnv.tearDown();
  });

  beforeEach(async () => {
    await testEnv.prismaClient.box.deleteMany();
  });

  test('save() should save a new box', async () => {
    const boxRepository = new PostgresBoxRepository();
    const boxId = 'box-id';
    const box = Box.emptyBoxOfIdForUser(boxId, 'user-id');
    await testEnv.prismaClient.$transaction(async (trx) => {
      await boxRepository.save(box)(trx);

      const expectedBox = await trx.box.findUnique({
        where: { id: boxId },
        select: {
          id: true,
          userId: true,
          Partition: {
            select: {
              id: true,
              partitionNumber: true,
            },
          },
        },
      });
      expect(expectedBox).toEqual({
        id: boxId,
        userId: 'user-id',
        Partition: [
          { id: box.partitions[0].id, partitionNumber: 1 },
          { id: box.partitions[1].id, partitionNumber: 2 },
          { id: box.partitions[2].id, partitionNumber: 3 },
          { id: box.partitions[3].id, partitionNumber: 4 },
          { id: box.partitions[4].id, partitionNumber: 5 },
          { id: box.archivedPartition.id, partitionNumber: 6 },
        ],
      });
    });
  });

  test('save() should update a box', async () => {
    const boxRepository = new PostgresBoxRepository();
    const boxId = 'box-id';
    const box = Box.emptyBoxOfIdForUser(boxId, 'user-id');
    await testEnv.prismaClient.$transaction(async (trx) => {
      await boxRepository.save(box)(trx);
      await boxRepository.save(box)(trx);

      const expectedBox = await trx.box.findUnique({
        where: { id: boxId },
        select: {
          id: true,
          userId: true,
          Partition: {
            select: {
              id: true,
              partitionNumber: true,
            },
          },
        },
      });
      expect(expectedBox).toEqual({
        id: boxId,
        userId: 'user-id',
        Partition: [
          { id: box.partitions[0].id, partitionNumber: 1 },
          { id: box.partitions[1].id, partitionNumber: 2 },
          { id: box.partitions[2].id, partitionNumber: 3 },
          { id: box.partitions[3].id, partitionNumber: 4 },
          { id: box.partitions[4].id, partitionNumber: 5 },
          { id: box.archivedPartition.id, partitionNumber: 6 },
        ],
      });
    });
  });

  test('getById() should return a box by its id', async () => {
    const boxRepository = new PostgresBoxRepository();
    const boxId = 'box-id';
    const box = Box.emptyBoxOfIdForUser(boxId, 'user-id');
    await testEnv.prismaClient.$transaction(async (trx) => {
      await trx.box.upsert({
        where: { id: box.id },
        update: { id: box.id },
        create: {
          id: box.id,
          userId: 'user-id',
        },
      });
      await trx.partition.createMany({
        skipDuplicates: true,
        data: [
          {
            boxId: box.id,
            id: box.partitions[1].id,
            partitionNumber: 2,
          },
          {
            boxId: box.id,
            id: box.partitions[0].id,
            partitionNumber: 1,
          },
          {
            boxId: box.id,
            id: box.partitions[3].id,
            partitionNumber: 4,
          },
          {
            boxId: box.id,
            id: box.partitions[2].id,
            partitionNumber: 3,
          },
          {
            boxId: box.id,
            id: box.archivedPartition.id,
            partitionNumber: 6,
          },
          {
            boxId: box.id,
            id: box.partitions[4].id,
            partitionNumber: 5,
          },
        ],
      });

      const expectedBox = await boxRepository.getById(boxId)(trx);

      expect(expectedBox).toEqual(box);
    });
  });

  test('getByUserId() should return a box by its user id', async () => {
    const boxRepository = new PostgresBoxRepository();
    const boxId = 'box-id';
    const box = Box.emptyBoxOfIdForUser(boxId, 'user-id');
    await testEnv.prismaClient.$transaction(async (trx) => {
      await trx.box.create({
        data: {
          id: box.id,
          userId: 'user-id',
        },
      });
      await trx.partition.createMany({
        skipDuplicates: true,
        data: [
          {
            boxId: box.id,
            id: box.partitions[1].id,
            partitionNumber: 2,
          },
          {
            boxId: box.id,
            id: box.partitions[0].id,
            partitionNumber: 1,
          },
          {
            boxId: box.id,
            id: box.partitions[3].id,
            partitionNumber: 4,
          },
          {
            boxId: box.id,
            id: box.partitions[2].id,
            partitionNumber: 3,
          },
          {
            boxId: box.id,
            id: box.archivedPartition.id,
            partitionNumber: 6,
          },
          {
            boxId: box.id,
            id: box.partitions[4].id,
            partitionNumber: 5,
          },
        ],
      });

      const expectedBox = await boxRepository.getByUserId('user-id')(trx);

      expect(expectedBox).toEqual(box);
    });
  });
});
