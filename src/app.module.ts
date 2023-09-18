import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { FlashcardModule } from './flashcard/flashcard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FlashcardModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
