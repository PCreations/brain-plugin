import { Inject, Injectable } from '@nestjs/common';
import { Box } from 'src/flashcard/model/box.entity';
import { BoxRepository } from 'src/flashcard/model/box.repository';
import { FlashcardRepository } from 'src/flashcard/model/flashcard.repository';
import { WithinTransaction } from 'src/flashcard/model/within-transaction';

export class CreateFlashcardCommand {
  id: string;
  front: string;
  back: string;
  userId: string;
}

@Injectable()
export class CreateFlashcard {
  constructor(
    private readonly flashcardRepository: FlashcardRepository,
    private readonly boxRepository: BoxRepository,
    @Inject(WithinTransaction)
    private readonly withinTransaction: WithinTransaction,
  ) {}

  public async execute(createFlashcardCommand: CreateFlashcardCommand) {
    return this.withinTransaction(async (trx) => {
      let box: Box;
      try {
        box = await this.boxRepository.getByUserId(
          createFlashcardCommand.userId,
        )(trx);
      } catch (e) {
        box = Box.emptyBoxOfIdForUser(
          this.boxRepository.getNextBoxId(),
          createFlashcardCommand.userId,
        );
        await this.boxRepository.save(box)(trx);
      }
      const flashcard = box.addNewFlashcard({
        id: createFlashcardCommand.id,
        front: createFlashcardCommand.front,
        back: createFlashcardCommand.back,
      });
      await this.flashcardRepository.save(flashcard)(trx);
    });
  }
}
