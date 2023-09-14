import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PostgresFlashcardRepository } from '../postgres-flashcard.repository';

const asyncExec = promisify(exec);

describe('PostgresFlashcardRepository', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
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
    });
    await asyncExec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`);

    await prismaClient.$connect();
  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  beforeEach(async () => {
    await prismaClient.flashcards.deleteMany();
  });

  test('save() should save a new flashcard', async () => {
    const flashcardRepository = new PostgresFlashcardRepository(prismaClient);
    const flashcardId = uuidv4();

    await flashcardRepository.save({
      id: flashcardId,
      front: 'some concept',
      back: 'definition of the concept',
    });

    const expectedFlashcard = await prismaClient.flashcards.findUnique({
      where: { id: flashcardId },
    });
    expect(expectedFlashcard).toEqual({
      id: flashcardId,
      front: 'some concept',
      back: 'definition of the concept',
    });
  });

  test('save() should update an existing flashcard', async () => {
    const flashcardRepository = new PostgresFlashcardRepository(prismaClient);
    const flashcardId = uuidv4();
    await flashcardRepository.save({
      id: flashcardId,
      front: 'some concept',
      back: 'definition of the concept',
    });

    await flashcardRepository.save({
      id: flashcardId,
      front: 'some other concept',
      back: 'definition of the other concept',
    });

    const expectedFlashcard = await prismaClient.flashcards.findUnique({
      where: { id: flashcardId },
    });
    expect(expectedFlashcard).toEqual({
      id: flashcardId,
      front: 'some other concept',
      back: 'definition of the other concept',
    });
  });

  test('getById() should return a flashcard by its id', async () => {
    const flashcardRepository = new PostgresFlashcardRepository(prismaClient);
    const flashcardId = uuidv4();
    await flashcardRepository.save({
      id: flashcardId,
      front: 'some concept',
      back: 'definition of the concept',
    });

    const expectedFlashcard = await flashcardRepository.getById(flashcardId);

    expect(expectedFlashcard).toEqual({
      id: flashcardId,
      front: 'some concept',
      back: 'definition of the concept',
    });
  });
});
