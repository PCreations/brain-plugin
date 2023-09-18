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
    const boxRepository = new PostgresBoxRepository(testEnv.prismaClient);
    const boxId = 'box-id';
    const box = Box.emptyBoxOfId(boxId);
    await boxRepository.save(box);

    const expectedBox = await testEnv.prismaClient.box.findUnique({
      where: { id: boxId },
      select: {
        id: true,
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

  test('save() should update a box', async () => {
    const boxRepository = new PostgresBoxRepository(testEnv.prismaClient);
    const boxId = 'box-id';
    const box = Box.emptyBoxOfId(boxId);
    await boxRepository.save(box);
    await boxRepository.save(box);

    const expectedBox = await testEnv.prismaClient.box.findUnique({
      where: { id: boxId },
      select: {
        id: true,
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

  test('getById() should return a box by its id', async () => {
    const boxRepository = new PostgresBoxRepository(testEnv.prismaClient);
    const boxId = 'box-id';
    const box = Box.emptyBoxOfId(boxId);
    await testEnv.prismaClient.box.upsert({
      where: { id: box.id },
      update: { id: box.id },
      create: {
        id: box.id,
      },
    });
    await testEnv.prismaClient.partition.createMany({
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

    const expectedBox = await boxRepository.getById(boxId);

    expect(expectedBox).toEqual(box);
  });
});
