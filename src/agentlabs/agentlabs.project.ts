import { Project } from '@agentlabs/node-sdk';
import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgentLabsProject implements OnModuleInit, OnApplicationShutdown {
  private readonly project: Project;
  private readonly agent: ReturnType<Project['agent']>;
  constructor(configService: ConfigService) {
    this.project = new Project({
      projectId: '4f2bdf9d-0d14-4d2b-9397-074e0efdd776',
      secret: configService.get('AGENT_LABS_SECRET_KEY'),
      url: 'https://craft-academy.app.agentlabs.dev',
    });
    this.agent = this.project.agent('fcd972af-ddfe-4b1b-ba86-9f074a3629be');
  }

  async onApplicationShutdown() {
    await this.project.disconnect();
  }

  async onModuleInit() {
    this.project.onChatMessage(async (message) => {
      if (message.text === 'ping') {
        this.agent.send({
          text: 'pong',
          conversationId: message.conversationId,
        });
        return;
      }
      this.agent.send({
        text: "I don't understand.",
        conversationId: message.conversationId,
      });
    });
    await this.project.connect();
  }
}
