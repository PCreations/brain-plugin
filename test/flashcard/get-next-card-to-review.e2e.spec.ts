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

describe('Feature: Getting the next flashcard to review', () => {
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

  test('/api/flashcard/get-next-card-to-review (GET) : no cards to review', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/flashcard/get-next-card-to-review',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      JSON.stringify({
        flashcard: 'NO_FLASHCARD_TO_REVIEW',
      }),
    );
  });

  test('/api/flashcard/get-next-card-to-review (GET) : no cards to review', async () => {
    const box = await boxRepository.getById('ze-box');
    await flashcardRepository.save(
      flashcardBuilder()
        .ofId('flashcard-id')
        .withContent({ front: 'front', back: 'back' })
        .inPartition(1)
        .withinBox(box)
        .build(),
    );

    const response = await app.inject({
      method: 'GET',
      url: '/api/flashcard/get-next-card-to-review',
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
