import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './healthcheck.controller';
import { FlashcardModule } from 'src/flashcard/flashcard.module';

@Module({
  controllers: [HealthCheckController],
  imports: [FlashcardModule, TerminusModule],
})
export class HealthCheckModule {}
