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
      select: {
        id: true,
        front: true,
        back: true,
        partitionId: true,
        lastReviewedAt: true,
        connectedTo: {
          select: {
            id: true,
          },
        },
      },
    });

    return new Flashcard(
      flashcard.id,
      flashcard.front,
      flashcard.back,
      flashcard.partitionId,
      flashcard.lastReviewedAt ?? undefined,
      flashcard.connectedTo[0]?.id ?? undefined,
      flashcard.connectedTo[1]?.id ?? undefined,
    );
  }

  async save(flashcard: Flashcard): Promise<void> {
    const data: {
      front: string;
      back: string;
      partitionId: string;
      lastReviewedAt?: Date;
      connectedTo?: {
        connect: {
          id: string;
        }[];
      };
    } = {
      front: flashcard.front,
      back: flashcard.back,
      partitionId: flashcard.partitionId,
      lastReviewedAt: flashcard.lastReviewedAt,
      ...(flashcard.flashcard1Id && flashcard.flashcard2Id
        ? {
            connectedTo: {
              connect: [
                { id: flashcard.flashcard1Id },
                { id: flashcard.flashcard2Id },
              ],
            },
          }
        : {}),
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
