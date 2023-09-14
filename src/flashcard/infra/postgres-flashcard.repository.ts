import { PrismaClient } from '.prisma/client';
import { Flashcard } from '../model/flashcard.entity';
import { FlashcardRepository } from '../model/flashcard.repository';

export class PostgresFlashcardRepository implements FlashcardRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async getById(flashcardId: string): Promise<Flashcard> {
    const flashcard = await this.prismaClient.flashcards.findUnique({
      where: { id: flashcardId },
    });

    return flashcard;
  }

  async save(flashcard: Flashcard): Promise<void> {
    const data: { front: string; back: string } = {
      front: flashcard.front,
      back: flashcard.back,
    };
    await this.prismaClient.flashcards.upsert({
      where: { id: flashcard.id },
      update: data,
      create: {
        id: flashcard.id,
        ...data,
      },
    });
  }
}
