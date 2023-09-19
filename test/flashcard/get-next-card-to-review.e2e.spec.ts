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

describe('Feature: Getting the next flashcard to review', () => {
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
  });

  afterAll(async () => {
    await app.close();
  });

  test('/api/flashcard/get-next-card-to-review (GET) : no cards to review', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/flashcard/get-next-card-to-review',
      headers: {
        authorization: `Bearer ${StubAuthenticationGateway.BOB_TEST_TOKEN_AND_UID}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      JSON.stringify({
        flashcard: 'NO_FLASHCARD_TO_REVIEW',
      }),
    );
  });

  test('/api/flashcard/get-next-card-to-review (GET) : no cards to review', async () => {
    await flashcardRepository.save(
      flashcardBuilder()
        .ofId('flashcard-id')
        .withContent({ front: 'front', back: 'back' })
        .inPartition(1)
        .withinBox(userBox)
        .build(),
    );

    const response = await app.inject({
      method: 'GET',
      url: '/api/flashcard/get-next-card-to-review',
      headers: {
        authorization: `Bearer ${StubAuthenticationGateway.BOB_TEST_TOKEN_AND_UID}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      JSON.stringify({
        flashcard: {
          id: 'flashcard-id',
          front: 'front',
          back: 'back',
        },
      }),
    );
  });
});
