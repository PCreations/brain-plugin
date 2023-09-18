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
    const flashcardRepository = new PostgresFlashcardRepository(
      testEnv.prismaClient,
    );
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

    const expectedFlashcard = await testEnv.prismaClient.flashcard.findUnique({
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
    const flashcardRepository = new PostgresFlashcardRepository(
      testEnv.prismaClient,
    );
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

    const expectedFlashcard = await testEnv.prismaClient.flashcard.findUnique({
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
    const flashcardRepository = new PostgresFlashcardRepository(
      testEnv.prismaClient,
    );
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
