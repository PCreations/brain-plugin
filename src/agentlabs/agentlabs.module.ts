import { Module } from '@nestjs/common';
import { AgentLabsProject } from './agentlabs.project';
import { ConfigModule } from '@nestjs/config';
import { FlashcardModule } from 'src/flashcard/flashcard.module';

@Module({
  imports: [ConfigModule, FlashcardModule],
  providers: [AgentLabsProject],
  exports: [],
})
export class AgentLabsModule {}
