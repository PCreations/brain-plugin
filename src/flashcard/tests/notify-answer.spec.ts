import { InMemoryBoxRepository } from '../infra/inmemory-box.repository';
import { Box } from '../model/box.entity';
import { flashcardBuilder } from './builders/flashcard.builder';
import {
  FlashcardFixture,
  createFlashcardFixture,
} from './fixtures/flashcard.fixture';

describe('Feature: notifying an answer to a flashcard', () => {
  let fixture: FlashcardFixture;
  const box = Box.emptyBoxOfId('ze-box');
  const boxRepository = new InMemoryBoxRepository();

  beforeAll(async () => {
    await boxRepository.save(Box.emptyBoxOfId('ze-box'));
  });

  beforeEach(() => {
    fixture = createFlashcardFixture({
      boxRepository,
    });
  });

  test('Example: A flashcard is in the first partition and we notify a correct answer, then the flashcard should move to the second partition', async () => {
    await fixture.givenExistingFlashcard(
      flashcardBuilder()
        .ofId('flashcard-id')
        .inPartition(box.partitions[0].id)
        .build(),
    );

    await fixture.whenNotifyingAnswer({
      flashcardId: 'flashcard-id',
      isCorrect: true,
    });

    await fixture.thenFlashcardShouldBeInPartition({
      flashcardId: 'flashcard-id',
      partitionNumber: 2,
    });
  });

  test('Example: A flashcard is in the second partition and we notify a correct answer, then the flashcard should move to the third partition', async () => {
    await fixture.givenExistingFlashcard(
      flashcardBuilder()
        .ofId('flashcard-id')
        .inPartition(box.partitions[1].id)
        .build(),
    );

    await fixture.whenNotifyingAnswer({
      flashcardId: 'flashcard-id',
      isCorrect: true,
    });

    await fixture.thenFlashcardShouldBeInPartition({
      flashcardId: 'flashcard-id',
      partitionNumber: 3,
    });
  });

  test('Example: A flashcard is in the second partition and we notify a wrong answer, then the flashcard should move back to the first partition', async () => {
    await fixture.givenExistingFlashcard(
      flashcardBuilder()
        .ofId('flashcard-id')
        .inPartition(box.partitions[1].id)
        .build(),
    );

    await fixture.whenNotifyingAnswer({
      flashcardId: 'flashcard-id',
      isCorrect: false,
    });

    await fixture.thenFlashcardShouldBeInPartition({
      flashcardId: 'flashcard-id',
      partitionNumber: 1,
    });
  });

  test('Example: A flashcard is in the fifth partition and we notify a correct answer, then the flashcard should be archived', async () => {
    await fixture.givenExistingFlashcard(
      flashcardBuilder()
        .ofId('flashcard-id')
        .inPartition(box.partitions[4].id)
        .build(),
    );

    await fixture.whenNotifyingAnswer({
      flashcardId: 'flashcard-id',
      isCorrect: true,
    });

    await fixture.thenFlashcardShouldBeArchived('flashcard-id');
  });
});
