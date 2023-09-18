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
import { PostgresFlashcardRepository } from '../postgres-flashcard.repository';
import { flashcardBuilder } from 'src/flashcard/tests/builders/flashcard.builder';
import { GetNextCardToReview } from 'src/flashcard/features/get-next-card-to-review/get-next-card-to-review.query';
import { StubDateProvider } from '../stub-date-provider';

const asyncExec = promisify(exec);

describe('GetNextCardToReview', () => {
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
    await prismaClient.box.deleteMany();
  });

  test('GetNextCardToReview() should return the next card to review', async () => {
    const now = new Date('2023-09-18T14:13:00.000Z');
    const dateProvider = new StubDateProvider();
    dateProvider.now = now;
    const boxRepository = new PostgresBoxRepository(prismaClient);
    const flashcardRepository = new PostgresFlashcardRepository(prismaClient);
    const boxId = 'box-id';
    const box = Box.emptyBoxOfId(boxId);
    await boxRepository.save(box);
    await Promise.all([
      flashcardRepository.save(
        flashcardBuilder()
          .ofId('flashcard1-id')
          .withContent({ front: 'front 1', back: 'back 1' })
          .inPartition(1)
          .withinBox(box)
          .build(),
      ),
      flashcardRepository.save(
        flashcardBuilder()
          .ofId('flashcard2-id')
          .withContent({ front: 'front 2', back: 'back 2' })
          .lastReviewed(new Date('2023-09-17T13:41:00.000Z'))
          .inPartition(2)
          .withinBox(box)
          .build(),
      ),
    ]);
    const getNextCardToReview = new GetNextCardToReview(
      prismaClient,
      dateProvider,
    );

    const nextCardToReview = await getNextCardToReview.execute({
      boxId: box.id,
    });
    expect(nextCardToReview).toEqual({
      flashcard: {
        id: 'flashcard1-id',
        front: 'front 1',
        back: 'back 1',
      },
    });
  });
});
