import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { FlashcardModule } from './flashcard/flashcard.module';
import { HealthCheckModule } from './healthcheck/healthcheck.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FlashcardModule,
    HealthCheckModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
