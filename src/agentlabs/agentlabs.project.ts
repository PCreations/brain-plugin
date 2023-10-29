import { Project } from '@agentlabs/node-sdk';
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { BufferMemory } from 'langchain/memory';
import { RedisChatMessageHistory } from 'langchain/stores/message/ioredis';
import { DynamicStructuredTool } from 'langchain/tools';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { setTimeout as asyncSetTimeout } from 'timers/promises';
import { GetNextCardToReviewAiToolController } from 'src/flashcard/features/get-next-card-to-review/get-next-card-to-review.aitool.controller';
import { NotifyAnswerAiToolController } from 'src/flashcard/features/notify-answer/notify-answer.aitool.controller';
import { GetNextCardToReview } from 'src/flashcard/features/get-next-card-to-review/get-next-card-to-review.query';
import { CreateFlashcard } from 'src/flashcard/features/create-flashcard/create-flashcard.usecase';
import { CreateFlashcardAiToolController } from 'src/flashcard/features/create-flashcard/create-flashcard.aitool.controller';
import { NotifyAnswer } from 'src/flashcard/features/notify-answer/notify-answer.usecase';
import { ListFlashcardsAiToolController } from 'src/flashcard/features/list-flashcards/list-flashcards.aitool.controller';
import { ListFlashcards } from 'src/flashcard/features/list-flashcards/list-flashcards.query';
import { CreateConnectedFlashcardAiToolController } from 'src/flashcard/features/create-connected-flashcard/create-flashcard.aitool.controller';
import { CreateConnectedFlashcard } from 'src/flashcard/features/create-connected-flashcard/create-connected-flashcard.usecase';

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

const uuidGeneratorTool = new DynamicStructuredTool({
  name: 'uuid-generator',
  description: 'generates a random uuid',
  schema: z.object({}),
  func: async () => {
    return uuidv4();
  },
  returnDirect: false,
});

// @TODO: do this in the proper way
const usersOnboarded = new Set<string>();

@Injectable()
export class AgentLabsProject
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly project!: Project;
  private readonly agent!: ReturnType<Project['agent']>;
  private readonly chatHistory: RedisChatMessageHistory;
  private memory!: BufferMemory;
  private readonly chatOpenAI!: ChatOpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly getNextCardToReview: GetNextCardToReview,
    private readonly notifyAnswer: NotifyAnswer,
    private readonly createFlashcard: CreateFlashcard,
    private readonly listFlashcards: ListFlashcards,
    private readonly createConnectedFlashcard: CreateConnectedFlashcard,
  ) {
    if (configService.get('DISABLE_AGENTLABS') === undefined) {
      this.chatOpenAI = this.createChatOpenAI();
      this.project = new Project({
        projectId: '4f2bdf9d-0d14-4d2b-9397-074e0efdd776',
        secret: configService.get('AGENT_LABS_SECRET_KEY') ?? '',
        url: 'https://craft-academy.app.agentlabs.dev',
      });
      this.agent = this.project.agent('fcd972af-ddfe-4b1b-ba86-9f074a3629be');
    }
  }

  async onApplicationShutdown() {
    await this.project?.disconnect();
  }

  private async getOnboarding(userId: string, conversationId: string) {
    const result = await this.runPlugin({
      text: "Salut ! On va se tutoyer et se parler de façon amicale et parfois un peu taquine. Explique-moi comment je peux interagir avec toi afin de m'aider à réviser mes connaissances sans répondre explicitement à mon message de salutation.",
      userId,
      conversationId,
    });
    this.memory.saveContext(
      {
        input:
          "Salut ! On va se tutoyer et se parler de façon amicale et parfois un peu taquin. Explique-moi comment je peux interagir avec toi afin de m'aider à réviser mes connaissances sans répondre explicitement à mon message de salutation.",
      },
      {
        output: result.output,
      },
    );
    return result.output;
  }

  async onApplicationBootstrap() {
    this.project?.onChatMessage(async (message) => {
      if (message.member.isAnonymous) {
        if (!usersOnboarded.has(message.memberId)) {
          usersOnboarded.add(message.memberId);
          const onboarding = await this.getOnboarding(
            message.memberId,
            message.conversationId,
          );

          await this.agent.send(
            {
              text: onboarding,
              conversationId: message.conversationId,
            },
            {
              format: 'Markdown',
            },
          );
        }
        return this.agent.requestLogin({
          conversationId: message.conversationId,
          text: "Juste avant que je puisse t'aider, merci de te connecter à BrAIn :)",
        });
      }
      if (!usersOnboarded.has(message.memberId)) {
        usersOnboarded.add(message.memberId);
        await this.getOnboarding(message.memberId, message.conversationId);
      }
      const result = await this.runPlugin({
        text: message.text,
        userId: message.memberId,
        conversationId: message.conversationId,
      });
      this.agent.send(
        {
          text: result.output,
          conversationId: message.conversationId,
        },
        {
          format: 'Markdown',
        },
      );
    });
    await exponentialBackoff(() => this.project?.connect());
  }

  private createChatOpenAI() {
    const prefix = `You are a friendly AI assistant specialized in helping the authenticated user reviewing their knowledge through flashcards. When the user wants to review their flashcard, you should retrieve their next flashcard to review, then you should ONLY display the front of the card, and DEFINITELY NOT the back which contains the answer. You MUST wait for the user to provide their answer before offering to show them the back of the card. When the user has given their answer, you MUST ask them if they think they have correctly answered so you can notify the system about the user having given a correct answer or not. You MUST get the next flashcard to review after having notified the system. If the user wants to create a new flaschard, they must provide a front and a back for the card, the front must be concise, representing only a concept, the back should explain this concept in a few sentences only. Before creating the flashcard, you should ask the user if the generated flashcard suits their need. If the user says that the flashcard is good for them, then you can really create the flashcard. You can also use all the flashcards to suggest some connections between flashcards, and ask the user to confirm or deny these connections before saving the connected flashcards`;

    return new ChatOpenAI({
      temperature: 0.5,
      modelName: 'gpt-4',
      prefixMessages: [
        {
          content: prefix,
          role: 'assistant',
        },
      ],
    });
  }

  private getTools(userId: string) {
    return [
      uuidGeneratorTool,
      new GetNextCardToReviewAiToolController(
        this.getNextCardToReview,
        userId,
        this.memory,
      ),
      new NotifyAnswerAiToolController(this.notifyAnswer, userId),
      new CreateFlashcardAiToolController(this.createFlashcard, userId),
      new ListFlashcardsAiToolController(
        this.listFlashcards,
        userId,
        this.memory,
      ),
      new CreateConnectedFlashcardAiToolController(
        this.createConnectedFlashcard,
        userId,
      ),
    ];
  }

  private async runPlugin({
    text,
    userId,
    conversationId,
  }: {
    text: string;
    userId: string;
    conversationId: string;
  }) {
    this.memory = new BufferMemory({
      chatHistory: new RedisChatMessageHistory({
        sessionId: `${userId}-${conversationId}`,
        url: this.configService.get('REDIS_URL'),
      }),
      memoryKey: 'chat_history',
      returnMessages: true,
    });
    const agent = await initializeAgentExecutorWithOptions(
      this.getTools(userId),
      this.chatOpenAI,
      {
        agentType: 'openai-functions',
        verbose: true,
        memory: this.memory,
      },
    );

    const result = await agent.call({
      input: text,
    });

    return result;
  }
}
