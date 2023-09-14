import { Module } from '@nestjs/common';
import { CreateFlashcardController } from './features/create-flashcard/create-flashcard.controller';
import { CreateFlashcard } from './features/create-flashcard/create-flashcard.usecase';
import { FlashcardRepository } from './model/flashcard.repository';
import { PostgresFlashcardRepository } from './infra/postgres-flashcard.repository';
import { PrismaService } from './infra/prisma.service';

@Module({
  imports: [],
  controllers: [CreateFlashcardController],
  providers: [
    CreateFlashcard,
    PrismaService,
    {
      provide: FlashcardRepository,
      useClass: PostgresFlashcardRepository,
    },
  ],
})
export class FlashcardModule {}
