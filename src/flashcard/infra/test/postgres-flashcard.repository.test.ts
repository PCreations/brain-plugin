import { Flashcard } from 'src/flashcard/model/flashcard.entity';
import { PostgresFlashcardRepository } from '../postgres-flashcard.repository';
import { createTestEnv } from 'src/test.env';

describe('PostgresFlashcardRepository', () => {
  const testEnv = createTestEnv();
  beforeAll(async () => {
    await testEnv.setUp();
  });

  afterAll(async () => {
    await testEnv.tearDown();
  });

  beforeEach(async () => {
    await testEnv.prismaClient.flashcard.deleteMany();
    await testEnv.prismaClient.box.upsert({
      where: { id: 'box-id' },
      update: { id: 'box-id' },
      create: {
        id: 'box-id',
        userId: 'user-id',
      },
    });
    await testEnv.prismaClient.partition.createMany({
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
    const flashcardRepository = new PostgresFlashcardRepository();
    const flashcardId = 'flashcard-id';
    await testEnv.prismaClient.$transaction(async (trx) => {
      await flashcardRepository.save(
        new Flashcard(
          'flashcard1-id',
          'some concept',
          'definition of the concept',
          'box-partition-id',
          new Date('2023-10-15T17:10:00.000Z'),
        ),
      )(trx);
      await flashcardRepository.save(
        new Flashcard(
          'flashcard2-id',
          'some concept',
          'definition of the concept',
          'box-partition-id',
          new Date('2023-10-15T17:10:00.000Z'),
        ),
      )(trx);

      await flashcardRepository.save(
        new Flashcard(
          flashcardId,
          'some concept',
          'definition of the concept',
          'box-partition-id',
          new Date('2023-10-15T17:10:00.000Z'),
          'flashcard1-id',
          'flashcard2-id',
        ),
      )(trx);

      const expectedFlashcard = await trx.flashcard.findUnique({
        where: { id: flashcardId },
        select: {
          id: true,
          front: true,
          back: true,
          partitionId: true,
          lastReviewedAt: true,
          connectedTo: {
            select: {
              id: true,
            },
          },
        },
      });
      expect(expectedFlashcard).toEqual({
        id: flashcardId,
        front: 'some concept',
        back: 'definition of the concept',
        partitionId: 'box-partition-id',
        lastReviewedAt: new Date('2023-10-15T17:10:00.000Z'),
        connectedTo: [
          {
            id: 'flashcard1-id',
          },
          {
            id: 'flashcard2-id',
          },
        ],
      });
    });
  });

  test('save() should update an existing flashcard', async () => {
    const flashcardRepository = new PostgresFlashcardRepository();
    const flashcardId = 'flashcard-id';
    await testEnv.prismaClient.$transaction(async (trx) => {
      await flashcardRepository.save(
        new Flashcard(
          'flashcard1-id',
          'some concept',
          'definition of the concept',
          'box-partition-id',
          new Date('2023-10-15T17:10:00.000Z'),
        ),
      )(trx);

      await flashcardRepository.save(
        new Flashcard(
          flashcardId,
          'some concept',
          'definition of concept',
          'box-partition2-id',
          new Date('2023-10-16T17:10:00.000Z'),
        ),
      )(trx);

      const expectedFlashcard = await trx.flashcard.findUnique({
        where: { id: flashcardId },
      });
      expect(expectedFlashcard).toEqual({
        id: flashcardId,
        front: 'some concept',
        back: 'definition of concept',
        partitionId: 'box-partition2-id',
        lastReviewedAt: new Date('2023-10-16T17:10:00.000Z'),
      });
    });
  });

  test('getById() should return a flashcard by its id', async () => {
    const flashcardRepository = new PostgresFlashcardRepository();
    const flashcardId = 'flashcard-id';
    await testEnv.prismaClient.$transaction(async (trx) => {
      await flashcardRepository.save(
        new Flashcard(
          flashcardId,
          'some concept',
          'definition of the concept',
          'box-partition-id',
          new Date('2023-10-15T17:10:00.000Z'),
        ),
      )(trx);

      const expectedFlashcard =
        await flashcardRepository.getById(flashcardId)(trx);

      expect(expectedFlashcard).toEqual({
        id: flashcardId,
        front: 'some concept',
        back: 'definition of the concept',
        partitionId: 'box-partition-id',
        lastReviewedAt: new Date('2023-10-15T17:10:00.000Z'),
      });
    });
  });

  test('getById() should return a connected flashcard by its id', async () => {
    const flashcardRepository = new PostgresFlashcardRepository();
    await testEnv.prismaClient.$transaction(async (trx) => {
      await flashcardRepository.save(
        new Flashcard(
          'flashcard1-id',
          'some concept',
          'definition of the concept',
          'box-partition-id',
          new Date('2023-10-15T17:10:00.000Z'),
        ),
      )(trx);
      await flashcardRepository.save(
        new Flashcard(
          'flashcard2-id',
          'some concept',
          'definition of the concept',
          'box-partition-id',
          new Date('2023-10-15T17:10:00.000Z'),
        ),
      )(trx);
      await flashcardRepository.save(
        new Flashcard(
          'flashcard3-id',
          'some concept 3',
          'definition of the concept 3',
          'box-partition-id',
          new Date('2023-10-15T17:10:00.000Z'),
        ),
      )(trx);
      await flashcardRepository.save(
        new Flashcard(
          'flashcard4-id',
          'connection between flashcard1 and flashcard3',
          'Explanation of the connection between flashcard1 and flashcard3',
          'box-partition-id',
          new Date('2023-10-15T17:10:00.000Z'),
        ),
      )(trx);

      const flashcardId = 'flashcard-id';
      await flashcardRepository.save(
        new Flashcard(
          flashcardId,
          'some concept',
          'definition of the concept',
          'box-partition-id',
          new Date('2023-10-15T17:10:00.000Z'),
          'flashcard1-id',
          'flashcard2-id',
        ),
      )(trx);

      const expectedFlashcard =
        await flashcardRepository.getById(flashcardId)(trx);

      expect(expectedFlashcard).toEqual(
        new Flashcard(
          flashcardId,
          'some concept',
          'definition of the concept',
          'box-partition-id',
          new Date('2023-10-15T17:10:00.000Z'),
          'flashcard1-id',
          'flashcard2-id',
        ),
      );
    });
  });
});
