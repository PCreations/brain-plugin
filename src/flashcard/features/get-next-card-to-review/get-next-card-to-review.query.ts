import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/flashcard/infra/prisma.service';
import {
  PartitionNumber,
  ReviewableFlashcard,
  getNextCardToReview,
} from './get-next-card';
import { GetNextCardToReviewDto } from './get-next-card-to-review.dto';
import { DateProvider } from 'src/flashcard/model/date-provider';

@Injectable()
export class GetNextCardToReview {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly dateProvider: DateProvider,
  ) {}

  async execute({
    userId,
  }: {
    userId: string;
  }): Promise<GetNextCardToReviewDto> {
    const result = await this.prismaClient.box.findFirstOrThrow({
      where: {
        userId: userId,
      },
      select: {
        Partition: {
          select: {
            id: true,
            flashcards: {
              select: {
                id: true,
                front: true,
                back: true,
                partitionId: true,
                lastReviewedAt: true,
                flashcard1: {
                  select: {
                    id: true,
                    front: true,
                    back: true,
                  },
                },
                flashcard2: {
                  select: {
                    id: true,
                    front: true,
                    back: true,
                  },
                },
              },
            },
            partitionNumber: true,
          },
          orderBy: {
            partitionNumber: 'asc',
          },
        },
      },
    });

    const queryFlashcardToReviewableFlashcard =
      (partitionNumber: PartitionNumber) =>
      (flashcard: {
        id: string;
        front: string;
        back: string;
        lastReviewedAt?: Date;
        flashcard1?: {
          id: string;
          front: string;
          back: string;
        };
        flashcard2?: {
          id: string;
          front: string;
          back: string;
        };
      }) => {
        const reviewableFlashcard: ReviewableFlashcard = {
          id: flashcard.id,
          front: flashcard.front,
          back: flashcard.back,
          lastReviewedAt: flashcard.lastReviewedAt ?? undefined,
          partitionNumber,
          connectedFlashcards:
            flashcard.flashcard1 != undefined &&
            flashcard.flashcard2 != undefined
              ? [flashcard.flashcard1, flashcard.flashcard2]
              : undefined,
        };
        if (reviewableFlashcard.connectedFlashcards === undefined) {
          delete reviewableFlashcard.connectedFlashcards; // Warning : potential memory leak
        }
        return reviewableFlashcard;
      };

    const reviewableFlashcards = result.Partition.flatMap((partition) =>
      partition.flashcards.map(
        queryFlashcardToReviewableFlashcard(
          partition.partitionNumber as PartitionNumber,
        ),
      ),
    );

    const flashcardToReview = getNextCardToReview({
      partitions: reviewableFlashcards,
      now: this.dateProvider.getNow(),
    });

    if (flashcardToReview === undefined) {
      return {
        data: {
          flashcard: 'NO_FLASHCARD_TO_REVIEW',
        },
      };
    }

    if (flashcardToReview.connectedFlashcards !== undefined) {
      const { connectedFlashcards, id, front, back } = flashcardToReview;
      return {
        data: {
          flashcard: {
            id,
            front,
            back,
          },
          connectedFlashcards,
        },
      };
    }

    return {
      data: {
        flashcard: flashcardToReview
          ? {
              id: flashcardToReview.id,
              front: flashcardToReview.front,
              back: flashcardToReview.back,
            }
          : 'NO_FLASHCARD_TO_REVIEW',
      },
    };
  }
}
