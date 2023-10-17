import { Module } from '@nestjs/common';
import { AgentLabsProject } from './agentlabs.project';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AgentLabsProject],
  exports: [],
})
export class AgentLabsModule {}
