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
import { Box } from 'src/flashcard/model/box.entity';
import { StubAuthenticationGateway } from 'src/auth/stub-authentication.gateway';

describe('Feature: Creating a flashcard', () => {
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

  test('/api/flashcard/create (POST)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/flashcard/create',
      headers: {
        authorization: `Bearer ${StubAuthenticationGateway.BOB_TEST_TOKEN_AND_UID}`,
      },
      body: {
        id: 'flashcard-id',
        front: 'Some other concept',
        back: 'Some other concept definition',
      },
    });

    const savedFlashcard = await flashcardRepository.getById('flashcard-id');

    expect(response.statusCode).toBe(201);
    expect(savedFlashcard).toEqual({
      id: 'flashcard-id',
      front: 'Some other concept',
      back: 'Some other concept definition',
      partitionId: userBox.partitions[0].id,
      lastReviewedAt: undefined,
    });
  });
});
