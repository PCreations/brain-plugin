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
import { Flashcard } from 'src/flashcard/model/flashcard.entity';

describe('Feature: Creating a connected flashcard', () => {
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
    await flashcardRepository.save(
      new Flashcard(
        'flashcard1-id',
        'some concept',
        'definition of the concept',
        userBox.partitions[0].id,
        new Date('2023-10-15T17:10:00.000Z'),
      ),
    );
    await flashcardRepository.save(
      new Flashcard(
        'flashcard2-id',
        'some concept',
        'definition of the concept',
        userBox.partitions[0].id,
        new Date('2023-10-15T17:10:00.000Z'),
      ),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  test('/api/flashcard/create-connected (POST)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/flashcard/create-connected',
      headers: {
        authorization: `Bearer ${StubAuthenticationGateway.BOB_TEST_TOKEN_AND_UID}`,
      },
      body: {
        id: 'flashcard3-id',
        front: 'connection between flashcard1 and flashcard2',
        back: 'Explanation of the connection between flashcard1 and flashcard2',
        flashcard1Id: 'flashcard1-id',
        flashcard2Id: 'flashcard2-id',
      },
    });

    const savedFlashcard = await flashcardRepository.getById('flashcard3-id');

    expect(response.statusCode).toBe(201);
    expect(savedFlashcard).toEqual({
      id: 'flashcard3-id',
      front: 'connection between flashcard1 and flashcard2',
      back: 'Explanation of the connection between flashcard1 and flashcard2',
      flashcard1Id: 'flashcard1-id',
      flashcard2Id: 'flashcard2-id',
      partitionId: userBox.partitions[0].id,
      lastReviewedAt: undefined,
    });
  });
});
