import { InMemoryBoxRepository } from '../infra/inmemory-box.repository';
import { Box } from '../model/box.entity';
import { flashcardBuilder } from './builders/flashcard.builder';
import {
  FlashcardFixture,
  createFlashcardFixture,
} from './fixtures/flashcard.fixture';

describe('Feature: notifying an answer to a flashcard', () => {
  let fixture: FlashcardFixture;
  const currentUser = 'bob';
  const box = Box.emptyBoxOfIdForUser('bob-box-id', currentUser);
  const boxRepository = new InMemoryBoxRepository();

  beforeAll(async () => {
    await boxRepository.save(box);
  });

  beforeEach(() => {
    fixture = createFlashcardFixture({
      boxRepository,
    });
  });

  test('Example: A flashcard is in the first partition and we notify a correct answer, then the flashcard should move to the second partition', async () => {
    const today = new Date('2023-10-15T17:10:00.000Z');
    fixture.givenNowIs(today);
    await fixture.givenExistingFlashcard(
      flashcardBuilder()
        .withinBox(box)
        .ofId('flashcard-id')
        .inPartition(1)
        .build(),
    );

    await fixture.whenNotifyingAnswer({
      flashcardId: 'flashcard-id',
      isCorrect: true,
      userId: currentUser,
    });

    await fixture.thenFlashcardShouldBe(
      flashcardBuilder()
        .withinBox(box)
        .ofId('flashcard-id')
        .inPartition(2)
        .lastReviewed(today)
        .build(),
    );
  });

  test('Example: A flashcard is in the second partition and we notify a correct answer, then the flashcard should move to the third partition', async () => {
    await fixture.givenExistingFlashcard(
      flashcardBuilder()
        .withinBox(box)
        .ofId('flashcard-id')
        .inPartition(2)
        .build(),
    );

    await fixture.whenNotifyingAnswer({
      flashcardId: 'flashcard-id',
      isCorrect: true,
      userId: currentUser,
    });

    await fixture.thenFlashcardShouldBe(
      flashcardBuilder()
        .withinBox(box)
        .ofId('flashcard-id')
        .inPartition(3)
        .build(),
    );
  });

  test('Example: A flashcard is in the second partition and we notify a wrong answer, then the flashcard should move back to the first partition', async () => {
    await fixture.givenExistingFlashcard(
      flashcardBuilder()
        .withinBox(box)
        .ofId('flashcard-id')
        .inPartition(2)
        .build(),
    );

    await fixture.whenNotifyingAnswer({
      flashcardId: 'flashcard-id',
      isCorrect: false,
      userId: currentUser,
    });

    await fixture.thenFlashcardShouldBe(
      flashcardBuilder()
        .withinBox(box)
        .ofId('flashcard-id')
        .inPartition(1)
        .build(),
    );
  });

  test('Example: A flashcard is in the first partition and we notify a wrong answer, then the flashcard should stay in the first partition', async () => {
    await fixture.givenExistingFlashcard(
      flashcardBuilder()
        .withinBox(box)
        .ofId('flashcard-id')
        .inPartition(1)
        .build(),
    );

    await fixture.whenNotifyingAnswer({
      flashcardId: 'flashcard-id',
      isCorrect: false,
      userId: currentUser,
    });

    await fixture.thenFlashcardShouldBe(
      flashcardBuilder()
        .withinBox(box)
        .ofId('flashcard-id')
        .inPartition(1)
        .build(),
    );
  });

  test('Example: A flashcard is in the fifth partition and we notify a correct answer, then the flashcard should be archived', async () => {
    await fixture.givenExistingFlashcard(
      flashcardBuilder()
        .withinBox(box)
        .ofId('flashcard-id')
        .inPartition(5)
        .build(),
    );

    await fixture.whenNotifyingAnswer({
      flashcardId: 'flashcard-id',
      isCorrect: true,
      userId: currentUser,
    });

    await fixture.thenFlashcardShouldBe(
      flashcardBuilder().withinBox(box).ofId('flashcard-id').archived().build(),
    );
  });
});
