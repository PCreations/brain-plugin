import { Injectable } from '@nestjs/common';
import { BoxRepository } from 'src/flashcard/model/box.repository';
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
  ) {}

  async execute(notifyAnswerCommand: NotifyAnswerCommand) {
    const box = await this.boxRepository.getById('ze-box');
    const flashcard = await this.flashcardRepository.getById(
      notifyAnswerCommand.flashcardId,
    );

    const flashcardInNewPartition = box.putFlashcardInNextPartition(flashcard);

    return this.flashcardRepository.save(flashcardInNewPartition);
  }
}
