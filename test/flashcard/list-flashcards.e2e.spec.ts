import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { configureApp } from 'src/configure-app';
import { BoxRepository } from 'src/flashcard/model/box.repository';
import { FlashcardRepository } from 'src/flashcard/model/flashcard.repository';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { createTestEnv } from '../../src/test.env';
import { PrismaService } from 'src/flashcard/infra/prisma.service';
import { flashcardBuilder } from 'src/flashcard/tests/builders/flashcard.builder';
import { StubAuthenticationGateway } from 'src/auth/stub-authentication.gateway';
import { Box } from 'src/flashcard/model/box.entity';

describe('Feature: Listing all the user flashcards', () => {
  let app: NestFastifyApplication;
  let flashcardRepository: FlashcardRepository;
  let boxRepository: BoxRepository;
  let userBox: Box;
  const testEnv = createTestEnv();
  beforeAll(async () => {
    await testEnv.setUp();
  });

  afterAll(async () => {
    await testEnv.tearDown();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(testEnv.prismaClient)
      .compile();
    boxRepository = moduleFixture.get<BoxRepository>(BoxRepository);
    flashcardRepository =
      moduleFixture.get<FlashcardRepository>(FlashcardRepository);
    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await configureApp(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    userBox = Box.emptyBoxOfIdForUser(
      'box-id',
      StubAuthenticationGateway.BOB_TEST_TOKEN_AND_UID,
    );
    await boxRepository.save(userBox);
    const flashcards = [
      flashcardBuilder()
        .ofId('flashcard-id-1')
        .withContent({ front: 'front1', back: 'back1' })
        .inPartition(1)
        .withinBox(userBox)
        .build(),
      flashcardBuilder()
        .ofId('flashcard-id-2')
        .withContent({ front: 'front2', back: 'back2' })
        .inPartition(2)
        .withinBox(userBox)
        .build(),
    ];
    await Promise.all(
      flashcards.map((flashcard) => flashcardRepository.save(flashcard)),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('/api/flashcard/list-flashcards (GET)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/flashcard/list-flashcards',
      headers: {
        authorization: `Bearer ${StubAuthenticationGateway.BOB_TEST_TOKEN_AND_UID}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      JSON.stringify({
        flashcards: [
          {
            id: 'flashcard-id-1',
            front: 'front1',
            back: 'back1',
          },
          {
            id: 'flashcard-id-2',
            front: 'front2',
            back: 'back2',
          },
        ],
      }),
    );
  });
});
