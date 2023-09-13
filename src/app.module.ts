import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FlashcardModule } from './flashcard/flashcard.module';

@Module({
  imports: [FlashcardModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
