import { Injectable } from '@nestjs/common';
import { Flashcard } from '../model/flashcard.entity';
import { FlashcardRepository } from '../model/flashcard.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class PostgresFlashcardRepository implements FlashcardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getById(flashcardId: string): Promise<Flashcard> {
    const flashcard = await this.prisma.flashcard.findUnique({
      where: { id: flashcardId },
    });

    return new Flashcard(
      flashcard.id,
      flashcard.front,
      flashcard.back,
      flashcard.partitionId,
      flashcard.lastReviewedAt ?? undefined,
    );
  }

  async save(flashcard: Flashcard): Promise<void> {
    const data: {
      front: string;
      back: string;
      partitionId: string;
      lastReviewedAt?: Date;
    } = {
      front: flashcard.front,
      back: flashcard.back,
      partitionId: flashcard.partitionId,
      lastReviewedAt: flashcard.lastReviewedAt,
    };
    await this.prisma.flashcard.upsert({
      where: { id: flashcard.id },
      update: data,
      create: {
        id: flashcard.id,
        ...data,
      },
    });
  }
}
