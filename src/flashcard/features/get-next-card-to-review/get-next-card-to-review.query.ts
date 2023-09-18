import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/flashcard/infra/prisma.service';
import {
  PartitionNumber,
  ReviewableFlashcard,
  getNextCardToReview,
} from '../get-next-card';
import { GetNextCardToReviewDto } from './get-next-card-to-review.dto';
import { DateProvider } from 'src/flashcard/model/date-provider';

@Injectable()
export class GetNextCardToReview {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly dateProvider: DateProvider,
  ) {}

  async execute({ boxId }: { boxId: string }): Promise<GetNextCardToReviewDto> {
    const result = await this.prismaClient.box.findFirstOrThrow({
      where: {
        id: boxId,
      },
      select: {
        Partition: {
          select: {
            id: true,
            flashcards: true,
            partitionNumber: true,
          },
          orderBy: {
            partitionNumber: 'asc',
          },
        },
      },
    });

    const reviewableFlashcards: ReviewableFlashcard[] =
      result.Partition.flatMap((partition) =>
        partition.flashcards.map((flashcard) => {
          const reviewableFlashcard: ReviewableFlashcard = {
            id: flashcard.id,
            front: flashcard.front,
            back: flashcard.back,
            lastReviewedAt: flashcard.lastReviewedAt ?? undefined,
            partitionNumber: partition.partitionNumber as PartitionNumber,
          };
          return reviewableFlashcard;
        }),
      );

    const flashcardToReview = getNextCardToReview({
      partitions: reviewableFlashcards,
      now: this.dateProvider.getNow(),
    });

    return {
      flashcard: flashcardToReview
        ? {
            id: flashcardToReview.id,
            front: flashcardToReview.front,
            back: flashcardToReview.back,
          }
        : 'NO_FLASHCARD_TO_REVIEW',
    };
  }
}
