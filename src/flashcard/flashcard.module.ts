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

@Module({
  imports: [],
  controllers: [
    CreateFlashcardController,
    NotifyAnswerController,
    GetNextCardToReviewController,
  ],
  providers: [
    CreateFlashcard,
    NotifyAnswer,
    GetNextCardToReview,
    PrismaService,
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
})
export class FlashcardModule {}
