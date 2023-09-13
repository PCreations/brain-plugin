import { Injectable } from '@nestjs/common';
import { Flashcard } from './flashcard.entity';

@Injectable()
export abstract class FlashcardRepository {
  abstract getById(flashcardId: string): Promise<Flashcard>;
  abstract save(flashcard: Flashcard): Promise<void>;
}
