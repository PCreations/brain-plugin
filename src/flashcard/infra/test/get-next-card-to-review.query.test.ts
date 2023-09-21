import { PostgresBoxRepository } from '../postgres-box.repository';
import { Box } from 'src/flashcard/model/box.entity';
import { PostgresFlashcardRepository } from '../postgres-flashcard.repository';
import { flashcardBuilder } from 'src/flashcard/tests/builders/flashcard.builder';
import { GetNextCardToReview } from 'src/flashcard/features/get-next-card-to-review/get-next-card-to-review.query';
import { StubDateProvider } from '../stub-date-provider';
import { createTestEnv } from 'src/test.env';
import { createWithinPrismaTransaction } from '../within-prisma-transaction';

describe('GetNextCardToReview', () => {
  const testEnv = createTestEnv();
  beforeAll(async () => {
    await testEnv.setUp();
  });

  afterAll(async () => {
    await testEnv.tearDown();
  });

  beforeEach(async () => {
    await testEnv.prismaClient.flashcard.deleteMany();
    await testEnv.prismaClient.box.deleteMany();
  });

  test('GetNextCardToReview() should return the next card to review', async () => {
    const now = new Date('2023-09-18T14:13:00.000Z');
    const dateProvider = new StubDateProvider();
    dateProvider.now = now;
    const boxRepository = new PostgresBoxRepository();
    const flashcardRepository = new PostgresFlashcardRepository();
    const boxId = 'box-id';
    const box = Box.emptyBoxOfIdForUser(boxId, 'user-id');
    await createWithinPrismaTransaction(testEnv.prismaClient)(async (trx) => {
      await boxRepository.save(box)(trx);
      await Promise.all([
        flashcardRepository.save(
          flashcardBuilder()
            .ofId('flashcard1-id')
            .withContent({ front: 'front 1', back: 'back 1' })
            .inPartition(1)
            .withinBox(box)
            .build(),
        )(trx),
        flashcardRepository.save(
          flashcardBuilder()
            .ofId('flashcard2-id')
            .withContent({ front: 'front 2', back: 'back 2' })
            .lastReviewed(new Date('2023-09-17T13:41:00.000Z'))
            .inPartition(2)
            .withinBox(box)
            .build(),
        )(trx),
      ]);
    });
    const getNextCardToReview = new GetNextCardToReview(
      testEnv.prismaClient,
      dateProvider,
    );

    const nextCardToReview = await getNextCardToReview.execute({
      userId: 'user-id',
    });
    expect(nextCardToReview).toEqual({
      data: {
        flashcard: {
          id: 'flashcard1-id',
          front: 'front 1',
          back: 'back 1',
        },
      },
    });
  });
});
