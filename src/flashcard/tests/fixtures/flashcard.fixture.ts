import {
  CreateFlashcard,
  CreateFlashcardCommand,
} from 'src/flashcard/features/create-flashcard/create-flashcard.usecase';
import {
  CreateConnectedFlashcard,
  CreateConnectedFlashcardCommand,
} from 'src/flashcard/features/create-connected-flashcard/create-connected-flashcard.usecase';
import {
  NotifyAnswer,
  NotifyAnswerCommand,
} from 'src/flashcard/features/notify-answer/notify-answer.usecase';
import { InMemoryBoxRepository } from 'src/flashcard/infra/inmemory-box.repository';
import { InMemoryFlashcardRepository } from 'src/flashcard/infra/inmemory-flashcard.repository';
import { StubDateProvider } from 'src/flashcard/infra/stub-date-provider';
import { Box } from 'src/flashcard/model/box.entity';
import { Flashcard } from 'src/flashcard/model/flashcard.entity';

export const createFlashcardFixture = ({
  boxRepository,
}: {
  boxRepository: InMemoryBoxRepository;
}) => {
  const stubDateProvider = new StubDateProvider();
  const flashcardRepository = new InMemoryFlashcardRepository();
  const notifyAnswer = new NotifyAnswer(
    flashcardRepository,
    boxRepository,
    stubDateProvider,
  );
  const createFlashcard = new CreateFlashcard(
    flashcardRepository,
    boxRepository,
  );
  const createConnectedFlashcard = new CreateConnectedFlashcard(
    flashcardRepository,
    boxRepository,
  );
  return {
    async givenExistingFlashcard(flashcard: Flashcard) {
      await flashcardRepository.save(flashcard);
    },
    async givenExistingBox(box: Box) {
      await boxRepository.save(box);
    },
    givenNowIs(now: Date) {
      stubDateProvider.now = now;
    },
    givenTheNextBoxIdWillBe(boxId: string) {
      boxRepository.nextId = boxId;
    },

    async whenNotifyingAnswer(notifyAnswerCommand: NotifyAnswerCommand) {
      return notifyAnswer.execute(notifyAnswerCommand);
    },
    async whenCreatingFlashcard(
      createFlashcardCommand: CreateFlashcardCommand,
    ) {
      return createFlashcard.execute(createFlashcardCommand);
    },
    async whenCreatingConnectedFlashcard(
      createConnectedFlashcardCommand: CreateConnectedFlashcardCommand,
    ) {
      return createConnectedFlashcard.execute(createConnectedFlashcardCommand);
    },

    async thenFlashcardShouldBe(expectedFlashcard: Flashcard) {
      const flashcard = await flashcardRepository.getById(expectedFlashcard.id);

      expect(flashcard).toEqual(expectedFlashcard);
    },
    async thenBoxShouldBe(expectedBox: Box) {
      const box = await boxRepository.getById(expectedBox.id);

      expect(box).toEqual(expectedBox);
    },
  };
};

export type FlashcardFixture = ReturnType<typeof createFlashcardFixture>;
