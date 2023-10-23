import { Inject, Injectable } from '@nestjs/common';
import { BoxRepository } from 'src/flashcard/model/box.repository';
import { DateProvider } from 'src/flashcard/model/date-provider';
import { FlashcardRepository } from 'src/flashcard/model/flashcard.repository';
import { WithinTransaction } from 'src/flashcard/model/within-transaction';

export class NotifyAnswerCommand {
  flashcardId!: string;
  isCorrect!: boolean;
  userId!: string;
}

@Injectable()
export class NotifyAnswer {
  constructor(
    private readonly flashcardRepository: FlashcardRepository,
    private readonly boxRepository: BoxRepository,
    private readonly dateProvider: DateProvider,
    @Inject(WithinTransaction)
    private readonly withinTransaction: WithinTransaction,
  ) {}

  async execute(notifyAnswerCommand: NotifyAnswerCommand) {
    return this.withinTransaction(async (trx) => {
      const box = await this.boxRepository.getByUserId(
        notifyAnswerCommand.userId,
      )(trx);
      const flashcard = await this.flashcardRepository.getById(
        notifyAnswerCommand.flashcardId,
      )(trx);

      const flashcardInNewPartition = box.handleFlashcardAnswer(flashcard, {
        isCorrect: notifyAnswerCommand.isCorrect,
        reviewDate: this.dateProvider.getNow(),
      });

      return this.flashcardRepository.save(flashcardInNewPartition)(trx);
    });
  }
}
