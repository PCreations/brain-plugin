import { InMemoryBoxRepository } from '../infra/inmemory-box.repository';
import { Box } from '../model/box.entity';
import { flashcardBuilder } from './builders/flashcard.builder';
import {
  FlashcardFixture,
  createFlashcardFixture,
} from './fixtures/flashcard.fixture';

describe('Feature: Creating a flashcard', () => {
  let fixture: FlashcardFixture;
  const boxRepository = new InMemoryBoxRepository();
  const box = Box.emptyBoxOfId('ze-box');

  beforeAll(async () => {
    await boxRepository.save(box);
  });

  beforeEach(() => {
    fixture = createFlashcardFixture({
      boxRepository,
    });
  });

  test('A created flashcard should be added in the first partition of the box', async () => {
    await fixture.whenCreatingFlashcard({
      id: 'flashcard-id',
      front: 'front',
      back: 'back',
    });

    await fixture.thenFlashcardShouldBe(
      flashcardBuilder()
        .ofId('flashcard-id')
        .withContent({ front: 'front', back: 'back' })
        .inPartition(1)
        .withinBox(box)
        .build(),
    );
  });
});
