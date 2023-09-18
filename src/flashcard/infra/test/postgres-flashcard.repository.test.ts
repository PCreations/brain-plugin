import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaService } from '../prisma.service';
import { Flashcard } from 'src/flashcard/model/flashcard.entity';
import { PostgresFlashcardRepository } from '../postgres-flashcard.repository';

const asyncExec = promisify(exec);

describe('PostgresFlashcardRepository', () => {
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
    await prismaClient.flashcard.deleteMany();
    await prismaClient.box.upsert({
      where: { id: 'box-id' },
      update: { id: 'box-id' },
      create: {
        id: 'box-id',
      },
    });
    await prismaClient.partition.createMany({
      skipDuplicates: true,
      data: [
        {
          boxId: 'box-id',
          id: 'box-partition-id',
          partitionNumber: 1,
        },
        {
          boxId: 'box-id',
          id: 'box-partition2-id',
          partitionNumber: 2,
        },
      ],
    });
  });

  test('save() should save a new flashcard', async () => {
    const flashcardRepository = new PostgresFlashcardRepository(prismaClient);
    const flashcardId = 'flashcard-id';

    await flashcardRepository.save(
      new Flashcard(
        flashcardId,
        'some concept',
        'definition of the concept',
        'box-partition-id',
        new Date('2023-10-15T17:10:00.000Z'),
      ),
    );

    const expectedFlashcard = await prismaClient.flashcard.findUnique({
      where: { id: flashcardId },
    });
    expect(expectedFlashcard).toEqual({
      id: flashcardId,
      front: 'some concept',
      back: 'definition of the concept',
      partitionId: 'box-partition-id',
      lastReviewedAt: new Date('2023-10-15T17:10:00.000Z'),
    });
  });

  test('save() should update an existing flashcard', async () => {
    const flashcardRepository = new PostgresFlashcardRepository(prismaClient);
    const flashcardId = 'flashcard-id';
    await flashcardRepository.save(
      new Flashcard(
        flashcardId,
        'some concept',
        'definition of the concept',
        'box-partition-id',
      ),
    );

    await flashcardRepository.save(
      new Flashcard(
        flashcardId,
        'some other concept',
        'definition of the other concept',
        'box-partition2-id',
        new Date('2023-10-15T17:10:00.000Z'),
      ),
    );

    const expectedFlashcard = await prismaClient.flashcard.findUnique({
      where: { id: flashcardId },
    });
    expect(expectedFlashcard).toEqual({
      id: flashcardId,
      front: 'some other concept',
      back: 'definition of the other concept',
      partitionId: 'box-partition2-id',
      lastReviewedAt: new Date('2023-10-15T17:10:00.000Z'),
    });
  });

  test('getById() should return a flashcard by its id', async () => {
    const flashcardRepository = new PostgresFlashcardRepository(prismaClient);
    const flashcardId = 'flashcard-id';
    await flashcardRepository.save(
      new Flashcard(
        flashcardId,
        'some concept',
        'definition of the concept',
        'box-partition-id',
        new Date('2023-10-15T17:10:00.000Z'),
      ),
    );

    const expectedFlashcard = await flashcardRepository.getById(flashcardId);

    expect(expectedFlashcard).toEqual({
      id: flashcardId,
      front: 'some concept',
      back: 'definition of the concept',
      partitionId: 'box-partition-id',
      lastReviewedAt: new Date('2023-10-15T17:10:00.000Z'),
    });
  });
});
