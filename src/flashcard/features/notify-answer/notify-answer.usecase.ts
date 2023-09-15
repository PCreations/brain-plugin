import { Injectable } from '@nestjs/common';
import { BoxRepository } from 'src/flashcard/model/box.repository';
import { DateProvider } from 'src/flashcard/model/date-provider';
import { FlashcardRepository } from 'src/flashcard/model/flashcard.repository';

export class NotifyAnswerCommand {
  flashcardId: string;
  isCorrect: boolean;
}

@Injectable()
export class NotifyAnswer {
  constructor(
    private readonly flashcardRepository: FlashcardRepository,
    private readonly boxRepository: BoxRepository,
    private readonly dateProvider: DateProvider,
  ) {}

  async execute(notifyAnswerCommand: NotifyAnswerCommand) {
    const box = await this.boxRepository.getById('ze-box');
    const flashcard = await this.flashcardRepository.getById(
      notifyAnswerCommand.flashcardId,
    );

    const flashcardInNewPartition = box.handleFlashcardAnswer(flashcard, {
      isCorrect: notifyAnswerCommand.isCorrect,
      reviewDate: this.dateProvider.getNow(),
    });

    return this.flashcardRepository.save(flashcardInNewPartition);
  }
}
