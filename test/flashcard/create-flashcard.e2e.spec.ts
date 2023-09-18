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

describe('Feature: Creating a flashcard', () => {
  let app: NestFastifyApplication;
  let flashcardRepository: FlashcardRepository;
  let boxRepository: BoxRepository;
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
  });

  afterAll(async () => {
    await app.close();
  });

  test('/api/flashcard/create (POST)', async () => {
    const zeBox = await boxRepository.getById('ze-box');
    const response = await app.inject({
      method: 'POST',
      url: '/api/flashcard/create',
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
      partitionId: zeBox.partitions[0].id,
      lastReviewedAt: undefined,
    });
  });
});
