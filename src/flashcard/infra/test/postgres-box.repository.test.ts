import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaService } from '../prisma.service';
import { PostgresBoxRepository } from '../postgres-box.repository';
import { Box } from 'src/flashcard/model/box.entity';

const asyncExec = promisify(exec);

describe('PostgresBoxRepository', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaService;
  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('brain-test')
      .withUsername('brain-test')
      .withPassword('brain-test')
      .withExposedPorts(5432)
      .start();
    const databaseUrl = `postgresql://brain-test:brain-test@${container.getHost()}:${container.getMappedPort(
      5432,
    )}/brain-test?schema=public`;
    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    }) as PrismaService;
    await asyncExec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`);

    await prismaClient.$connect();
  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  beforeEach(async () => {
    await prismaClient.box.deleteMany();
  });

  test('save() should save a new box', async () => {
    const boxRepository = new PostgresBoxRepository(prismaClient);
    const boxId = 'box-id';
    const box = Box.emptyBoxOfId(boxId);
    await boxRepository.save(box);

    const expectedBox = await prismaClient.box.findUnique({
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
    const boxRepository = new PostgresBoxRepository(prismaClient);
    const boxId = 'box-id';
    const box = Box.emptyBoxOfId(boxId);
    await boxRepository.save(box);
    await boxRepository.save(box);

    const expectedBox = await prismaClient.box.findUnique({
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
    const boxRepository = new PostgresBoxRepository(prismaClient);
    const boxId = 'box-id';
    const box = Box.emptyBoxOfId(boxId);
    await prismaClient.box.upsert({
      where: { id: box.id },
      update: { id: box.id },
      create: {
        id: box.id,
      },
    });
    await prismaClient.partition.createMany({
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
