import { InMemoryBoxRepository } from '../infra/inmemory-box.repository';
import { Box } from '../model/box.entity';
import {
  FlashcardFixture,
  createFlashcardFixture,
} from './fixtures/flashcard.fixture';

describe('Feature: Creating a flashcard', () => {
  let fixture: FlashcardFixture;
  const boxRepository = new InMemoryBoxRepository();

  beforeAll(async () => {
    await boxRepository.save(Box.emptyBoxOfId('ze-box'));
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

    await fixture.thenFlashcardShouldBeInPartition({
      flashcardId: 'flashcard-id',
      partitionNumber: 1,
    });
  });
});
