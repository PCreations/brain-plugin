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
    try {
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
                  connectedTo: {
                    take: 2,
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
        (flashcard: (typeof result)['Partition'][0]['flashcards'][0]) => {
          const reviewableFlashcard: ReviewableFlashcard = {
            id: flashcard.id,
            front: flashcard.front,
            back: flashcard.back,
            lastReviewedAt: flashcard.lastReviewedAt ?? undefined,
            partitionNumber,
            connectedFlashcards:
              flashcard.connectedTo.length > 0
                ? [flashcard.connectedTo[0], flashcard.connectedTo[1]]
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
    } catch (error) {
      console.warn(error);
      return {
        data: {
          flashcard: 'NO_FLASHCARD_TO_REVIEW',
        },
      };
    }
  }
}
