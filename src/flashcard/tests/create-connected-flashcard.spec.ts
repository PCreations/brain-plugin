import { InMemoryBoxRepository } from '../infra/inmemory-box.repository';
import { Box } from '../model/box.entity';
import { flashcardBuilder } from './builders/flashcard.builder';
import {
  FlashcardFixture,
  createFlashcardFixture,
} from './fixtures/flashcard.fixture';

describe('Feature: Creating a connected flashcard', () => {
  let fixture: FlashcardFixture;
  const boxRepository = new InMemoryBoxRepository();

  beforeEach(() => {
    fixture = createFlashcardFixture({
      boxRepository,
    });
  });

  test('A new box should be created if there is no box for the current user', async () => {
    const expectedBobBox = Box.emptyBoxOfIdForUser('bob-box-id', 'bob');
    fixture.givenTheNextBoxIdWillBe('bob-box-id');

    await fixture.whenCreatingConnectedFlashcard({
      id: 'flashcard-id',
      flashcard1Id: 'flashcard1-id',
      flashcard2Id: 'flashcard2-id',
      front: 'front',
      back: 'back',
      userId: 'bob',
    });

    await fixture.thenFlashcardShouldBe(
      flashcardBuilder()
        .ofId('flashcard-id')
        .withContent({ front: 'front', back: 'back' })
        .inPartition(1)
        .connectedTo({
          flashcard1: 'flashcard1-id',
          flashcard2: 'flashcard2-id',
        })
        .withinBox(expectedBobBox)
        .build(),
    );
    await fixture.thenBoxShouldBe(expectedBobBox);
  });

  test('A created connected flashcard should be added in the first partition of the box', async () => {
    const box = Box.emptyBoxOfIdForUser('bob-box-id', 'bob');
    fixture.givenExistingBox(box);

    await fixture.whenCreatingConnectedFlashcard({
      id: 'flashcard-id',
      flashcard1Id: 'flashcard1-id',
      flashcard2Id: 'flashcard2-id',
      front: 'front',
      back: 'back',
      userId: 'bob',
    });

    await fixture.thenFlashcardShouldBe(
      flashcardBuilder()
        .ofId('flashcard-id')
        .withContent({ front: 'front', back: 'back' })
        .inPartition(1)
        .connectedTo({
          flashcard1: 'flashcard1-id',
          flashcard2: 'flashcard2-id',
        })
        .withinBox(box)
        .build(),
    );
  });
});
