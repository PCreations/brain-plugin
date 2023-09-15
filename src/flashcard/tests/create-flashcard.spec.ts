import { CreateFlashcard } from '../features/create-flashcard/create-flashcard.usecase';
import { InMemoryBoxRepository } from '../infra/inmemory-box.repository';
import { InMemoryFlashcardRepository } from '../infra/inmemory-flashcard.repository';
import { Box } from '../model/box.entity';

describe('Feature: Creating a flashcard', () => {
  test('A created flashcard should be added in the first partition of the box', async () => {
    const boxRepository = new InMemoryBoxRepository();
    const flashcardRepository = new InMemoryFlashcardRepository();
    const createFlashcard = new CreateFlashcard(
      flashcardRepository,
      boxRepository,
    );
    const box = Box.emptyBoxOfId('ze-box');
    await boxRepository.save(box);

    await createFlashcard.execute({
      id: 'flashcard-id',
      front: 'front',
      back: 'back',
    });

    const createdFlashcard = await flashcardRepository.getById('flashcard-id');
    expect(createdFlashcard.partitionId).toEqual(box.partitions[0].id);
  });
});
