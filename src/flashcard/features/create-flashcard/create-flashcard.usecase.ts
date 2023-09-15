import { Injectable } from '@nestjs/common';
import { BoxRepository } from 'src/flashcard/model/box.repository';
import { FlashcardRepository } from 'src/flashcard/model/flashcard.repository';

export class CreateFlashcardCommand {
  id: string;
  front: string;
  back: string;
}

@Injectable()
export class CreateFlashcard {
  constructor(
    private readonly flashcardRepository: FlashcardRepository,
    private readonly boxRepository: BoxRepository,
  ) {}

  public async execute(createFlashcardCommand: CreateFlashcardCommand) {
    const box = await this.boxRepository.getById('ze-box');
    const flashcard = box.addNewFlashcard({
      id: createFlashcardCommand.id,
      front: createFlashcardCommand.front,
      back: createFlashcardCommand.back,
    });
    await this.flashcardRepository.save(flashcard);
  }
}
