import { Injectable } from '@nestjs/common';
import { Flashcard } from '../model/flashcard.entity';
import { FlashcardRepository } from '../model/flashcard.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class PostgresFlashcardRepository implements FlashcardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getById(flashcardId: string): Promise<Flashcard> {
    const flashcard = await this.prisma.flashcards.findUnique({
      where: { id: flashcardId },
    });

    return flashcard;
  }

  async save(flashcard: Flashcard): Promise<void> {
    const data: { front: string; back: string } = {
      front: flashcard.front,
      back: flashcard.back,
    };
    await this.prisma.flashcards.upsert({
      where: { id: flashcard.id },
      update: data,
      create: {
        id: flashcard.id,
        ...data,
      },
    });
  }
}
