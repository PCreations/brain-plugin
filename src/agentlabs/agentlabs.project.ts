import { Project } from '@agentlabs/node-sdk';
import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import {
  RequestsGetTool,
  RequestsPostTool,
  AIPluginTool,
} from 'langchain/tools';
import { ConfigService } from '@nestjs/config';
import { setTimeout as asyncSetTimeout } from 'timers/promises';

const exponentialBackoff = async (fn: () => Promise<void>) => {
  let retries = 0;
  while (retries < 5) {
    try {
      await fn();
      break;
    } catch (error) {
      retries++;
      console.log(`Error, retrying in ${2 ** retries * 1000}ms`, error);
      await asyncSetTimeout(2 ** retries * 1000);
    }
  }
};

@Injectable()
export class AgentLabsProject implements OnModuleInit, OnApplicationShutdown {
  private readonly project: Project;
  private readonly agent: ReturnType<Project['agent']>;
  private readonly serverUrl: string;
  constructor(configService: ConfigService) {
    if (configService.get('DISABLE_AGENTLABS') === undefined) {
      this.project = new Project({
        projectId: '4f2bdf9d-0d14-4d2b-9397-074e0efdd776',
        secret: configService.get('AGENT_LABS_SECRET_KEY'),
        url: 'https://craft-academy.app.agentlabs.dev',
      });
      this.agent = this.project.agent('fcd972af-ddfe-4b1b-ba86-9f074a3629be');
      this.serverUrl = configService.get('SERVER_URL');
    }
  }

  async onApplicationShutdown() {
    await this.project?.disconnect();
  }

  async onModuleInit() {
    this.project?.onChatMessage(async (message) => {
      const result = await this.runPlugin(message.text);
      this.agent.send({
        text: JSON.stringify(result, null, 2),
        conversationId: message.conversationId,
      });
    });
    await exponentialBackoff(() => this.project?.connect());
  }

  private async runPlugin(prompt: string) {
    const tools = [
      new RequestsGetTool({
        Authorization: 'Bearer bob',
      }),
      new RequestsPostTool({
        Authorization: 'Bearer bob',
      }),
      await AIPluginTool.fromPluginUrl(
        `${this.serverUrl}/.well-known/ai-plugin.json`,
      ),
    ];
    const agent = await initializeAgentExecutorWithOptions(
      tools,
      new ChatOpenAI({ temperature: 0.2, modelName: 'gpt-4' }),
      {
        agentType: 'chat-conversational-react-description',
        verbose: true,
      },
    );

    const result = await agent.call({
      input: prompt,
    });

    return result;
  }
}
