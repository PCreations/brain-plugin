import { Module } from '@nestjs/common';
import { CreateFlashcardController } from './features/create-flashcard/create-flashcard.controller';
import { CreateFlashcard } from './features/create-flashcard/create-flashcard.usecase';
import { InMemoryFlashcardRepository } from './infra/inmemory-flashcard.repository';
import { FlashcardRepository } from './model/flashcard.repository';

@Module({
  imports: [],
  controllers: [CreateFlashcardController],
  providers: [
    CreateFlashcard,
    {
      provide: FlashcardRepository,
      useClass: InMemoryFlashcardRepository,
    },
  ],
})
export class FlashcardModule {}
