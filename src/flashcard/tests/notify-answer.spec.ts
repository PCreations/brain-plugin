import { NotifyAnswer } from '../features/notify-answer/notify-answer.usecase';
import { InMemoryBoxRepository } from '../infra/inmemory-box.repository';
import { InMemoryFlashcardRepository } from '../infra/inmemory-flashcard.repository';
import { Box } from '../model/box.entity';
import { Flashcard } from '../model/flashcard.entity';

describe('Feature: notifying an answer to a flashcard', () => {
  test('Example: A flashcard is in the first partition and we notify a correct answer, then the flashcard should move to the second partition', async () => {
    const box = Box.emptyBoxOfId('ze-box');
    const boxRepository = new InMemoryBoxRepository();
    const flashcardRepository = new InMemoryFlashcardRepository();
    await boxRepository.save(box);
    await flashcardRepository.save(
      new Flashcard('flashcard-id', 'front', 'back', box.partitions[0].id),
    );
    const notifyAnswer = new NotifyAnswer(flashcardRepository, boxRepository);

    await notifyAnswer.execute({
      flashcardId: 'flashcard-id',
      isCorrect: true,
    });

    const flashcard = await flashcardRepository.getById('flashcard-id');
    expect(flashcard.partitionId).toEqual(box.partitions[1].id);
  });

  test('Example: A flashcard is in the second partition and we notify a correct answer, then the flashcard should move to the third partition', async () => {
    const box = Box.emptyBoxOfId('ze-box');
    const boxRepository = new InMemoryBoxRepository();
    const flashcardRepository = new InMemoryFlashcardRepository();
    await boxRepository.save(box);
    await flashcardRepository.save(
      new Flashcard('flashcard-id', 'front', 'back', box.partitions[1].id),
    );
    const notifyAnswer = new NotifyAnswer(flashcardRepository, boxRepository);

    await notifyAnswer.execute({
      flashcardId: 'flashcard-id',
      isCorrect: true,
    });

    const flashcard = await flashcardRepository.getById('flashcard-id');
    expect(flashcard.partitionId).toEqual(box.partitions[2].id);
  });
});
