import { Injectable } from '@nestjs/common';
import { Flashcard } from 'src/flashcard/model/flashcard.entity';
import { FlashcardRepository } from 'src/flashcard/model/flashcard.repository';

export class CreateFlashcardCommand {
  id: string;
  front: string;
  back: string;
}

@Injectable()
export class CreateFlashcard {
  constructor(private readonly flashcardRepository: FlashcardRepository) {}

  public async execute(createFlashcardCommand: CreateFlashcardCommand) {
    this.flashcardRepository.save(
      new Flashcard(
        createFlashcardCommand.id,
        createFlashcardCommand.front,
        createFlashcardCommand.back,
      ),
    );
  }
}
