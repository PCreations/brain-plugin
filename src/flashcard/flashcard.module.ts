import { Module } from '@nestjs/common';
import { CreateFlashcardController } from './features/create-flashcard/create-flashcard.controller';
import { CreateFlashcard } from './features/create-flashcard/create-flashcard.usecase';
import { FlashcardRepository } from './model/flashcard.repository';
import { PostgresFlashcardRepository } from './infra/postgres-flashcard.repository';
import { PrismaService } from './infra/prisma.service';
import { NotifyAnswerController } from './features/notify-answer/notify-answer.controller';
import { BoxRepository } from './model/box.repository';
import { InMemoryBoxRepository } from './infra/inmemory-box.repository';

@Module({
  imports: [],
  controllers: [CreateFlashcardController, NotifyAnswerController],
  providers: [
    CreateFlashcard,
    PrismaService,
    {
      provide: FlashcardRepository,
      useClass: PostgresFlashcardRepository,
    },
    {
      provide: BoxRepository,
      useClass: InMemoryBoxRepository,
    },
  ],
})
export class FlashcardModule {}
