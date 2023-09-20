import { Injectable } from '@nestjs/common';
import { Box } from 'src/flashcard/model/box.entity';
import { BoxRepository } from 'src/flashcard/model/box.repository';
import { FlashcardRepository } from 'src/flashcard/model/flashcard.repository';

export class CreateConnectedFlashcardCommand {
  id: string;
  front: string;
  back: string;
  userId: string;
  flashcard1Id: string;
  flashcard2Id: string;
}

@Injectable()
export class CreateConnectedFlashcard {
  constructor(
    private readonly flashcardRepository: FlashcardRepository,
    private readonly boxRepository: BoxRepository,
  ) {}

  public async execute(
    createFlashcardCommand: CreateConnectedFlashcardCommand,
  ) {
    let box: Box;
    try {
      box = await this.boxRepository.getByUserId(createFlashcardCommand.userId);
    } catch (e) {
      box = Box.emptyBoxOfIdForUser(
        this.boxRepository.getNextBoxId(),
        createFlashcardCommand.userId,
      );
      await this.boxRepository.save(box);
    }
    const flashcard = box.addNewFlashcard({
      id: createFlashcardCommand.id,
      front: createFlashcardCommand.front,
      back: createFlashcardCommand.back,
      flashcard1Id: createFlashcardCommand.flashcard1Id,
      flashcard2Id: createFlashcardCommand.flashcard2Id,
    });
    await this.flashcardRepository.save(flashcard);
  }
}
