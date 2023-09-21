import { Module } from '@nestjs/common';
import { CreateFlashcardController } from './features/create-flashcard/create-flashcard.controller';
import { CreateFlashcard } from './features/create-flashcard/create-flashcard.usecase';
import { FlashcardRepository } from './model/flashcard.repository';
import { PrismaService } from './infra/prisma.service';
import { NotifyAnswerController } from './features/notify-answer/notify-answer.controller';
import { BoxRepository } from './model/box.repository';
import { PostgresFlashcardRepository } from './infra/postgres-flashcard.repository';
import { PostgresBoxRepository } from './infra/postgres-box.repository';
import { NotifyAnswer } from './features/notify-answer/notify-answer.usecase';
import { DateProvider } from './model/date-provider';
import { RealDateProvider } from './infra/real-date-provider';
import { GetNextCardToReviewController } from './features/get-next-card-to-review/get-next-card-to-review.controller';
import { GetNextCardToReview } from './features/get-next-card-to-review/get-next-card-to-review.query';
import { ListFlashcards } from './features/list-flashcards/list-flashcards.query';
import { ListFlashcardsController } from './features/list-flashcards/list-flashcard.controller';
import { CreateConnectedFlashcard } from './features/create-connected-flashcard/create-connected-flashcard.usecase';
import { CreateConnectedFlashcardController } from './features/create-connected-flashcard/create-connected-flashcard.controller';
import { WithinTransaction } from './model/within-transaction';
import { createWithinPrismaTransaction } from './infra/within-prisma-transaction';

@Module({
  imports: [],
  controllers: [
    CreateFlashcardController,
    CreateConnectedFlashcardController,
    NotifyAnswerController,
    GetNextCardToReviewController,
    ListFlashcardsController,
  ],
  providers: [
    CreateFlashcard,
    CreateConnectedFlashcard,
    NotifyAnswer,
    GetNextCardToReview,
    ListFlashcards,
    PrismaService,
    {
      provide: WithinTransaction,
      useFactory(prismaService: PrismaService) {
        return createWithinPrismaTransaction(prismaService);
      },
      inject: [PrismaService],
    },
    {
      provide: FlashcardRepository,
      useClass: PostgresFlashcardRepository,
    },
    {
      provide: BoxRepository,
      useClass: PostgresBoxRepository,
    },
    {
      provide: DateProvider,
      useClass: RealDateProvider,
    },
  ],
  exports: [PrismaService],
})
export class FlashcardModule {}
