import { Flashcard } from '../model/flashcard.entity';
import { FlashcardRepository } from '../model/flashcard.repository';

export class InMemoryFlashcardRepository implements FlashcardRepository {
  private readonly flashcardsById = new Map<string, Flashcard>();

  getById(flashcardId: string): Promise<Flashcard> {
    const flashcard = this.flashcardsById.get(flashcardId);
    if (flashcard) {
      return Promise.resolve(flashcard);
    }
    throw new Error(`Flashcard with id ${flashcardId} not found`);
  }

  save(flashcard: Flashcard): Promise<void> {
    this.flashcardsById.set(flashcard.id, flashcard);

    return Promise.resolve();
  }
}
