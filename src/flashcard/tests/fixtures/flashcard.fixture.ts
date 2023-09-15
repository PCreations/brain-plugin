import {
  CreateFlashcard,
  CreateFlashcardCommand,
} from 'src/flashcard/features/create-flashcard/create-flashcard.usecase';
import {
  NotifyAnswer,
  NotifyAnswerCommand,
} from 'src/flashcard/features/notify-answer/notify-answer.usecase';
import { InMemoryFlashcardRepository } from 'src/flashcard/infra/inmemory-flashcard.repository';
import { BoxRepository } from 'src/flashcard/model/box.repository';
import { Flashcard } from 'src/flashcard/model/flashcard.entity';

export const createFlashcardFixture = ({
  boxRepository,
}: {
  boxRepository: BoxRepository;
}) => {
  const flashcardRepository = new InMemoryFlashcardRepository();
  const notifyAnswer = new NotifyAnswer(flashcardRepository, boxRepository);
  const createFlashcard = new CreateFlashcard(
    flashcardRepository,
    boxRepository,
  );
  return {
    async givenExistingFlashcard(flashcard: Flashcard) {
      await flashcardRepository.save(flashcard);
    },

    async whenNotifyingAnswer(notifyAnswerCommand: NotifyAnswerCommand) {
      return notifyAnswer.execute(notifyAnswerCommand);
    },
    async whenCreatingFlashcard(
      createFlashcardCommand: CreateFlashcardCommand,
    ) {
      return createFlashcard.execute(createFlashcardCommand);
    },

    async thenFlashcardShouldBe(expectedFlashcard: Flashcard) {
      const flashcard = await flashcardRepository.getById(expectedFlashcard.id);

      expect(flashcard).toEqual(expectedFlashcard);
    },
  };
};

export type FlashcardFixture = ReturnType<typeof createFlashcardFixture>;
