import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { FlashcardRepository } from 'src/flashcard/model/flashcard.repository';
import { configureApp } from 'src/configure-app';
import * as request from 'supertest';
import { BoxRepository } from 'src/flashcard/model/box.repository';
import { PrismaService } from 'src/flashcard/infra/prisma.service';
import { PrismaTestingHelper } from '@chax-at/transactional-prisma-testing';
import { ConfigModule } from '@nestjs/config';
import { flashcardBuilder } from 'src/flashcard/tests/builders/flashcard.builder';

describe('Feature: Notifying a good answer to a flashcard', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let prismaTestingHelper: PrismaTestingHelper<PrismaService> | undefined;
  let flashcardRepository: FlashcardRepository;
  let boxRepository: BoxRepository;

  beforeEach(async () => {
    if (prismaTestingHelper == null) {
      const originalPrismaService = new PrismaService();
      prismaTestingHelper = new PrismaTestingHelper(originalPrismaService);
      prisma = prismaTestingHelper.getProxyClient();
    }

    await prismaTestingHelper.startNewTransaction({
      timeout: 30000,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(ConfigModule)
      .useModule(
        ConfigModule.forRoot({
          envFilePath: '.env.e2e',
        }),
      )
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    boxRepository = moduleFixture.get<BoxRepository>(BoxRepository);
    flashcardRepository =
      moduleFixture.get<FlashcardRepository>(FlashcardRepository);
    app = moduleFixture.createNestApplication();
    await configureApp(app);
    await app.init();
  });

  afterEach(() => {
    prismaTestingHelper?.rollbackCurrentTransaction();
  });

  afterAll(() => app.close());

  describe('Example: The flashcard is in the first partition', () => {
    test('/api/flashcard/notify-answer (PUT) - the correct answer is given thus the flashcard should be in the second partition', async () => {
      const zeBox = await boxRepository.getById('ze-box');
      await flashcardRepository.save(
        flashcardBuilder()
          .ofId('flashcard-id')
          .inPartition(zeBox.partitions[0].id)
          .build(),
      );

      await request(app.getHttpServer())
        .put('/api/flashcard/notify-answer')
        .send({
          flashcardId: 'flashcard-id',
          isCorrect: true,
        })
        .expect(200);

      const editedFlashcard = await flashcardRepository.getById('flashcard-id');
      expect(editedFlashcard.partitionId).toEqual(zeBox.partitions[1].id);
    });
  });

  describe('Example: The flashcard is in the second partition', () => {
    test('/api/flashcard/notify-answer (PUT) - the wrong answer is given thus the flashcard should be in the first partition', async () => {
      const zeBox = await boxRepository.getById('ze-box');
      await flashcardRepository.save(
        flashcardBuilder()
          .ofId('flashcard-id')
          .inPartition(zeBox.partitions[1].id)
          .build(),
      );

      await request(app.getHttpServer())
        .put('/api/flashcard/notify-answer')
        .send({
          flashcardId: 'flashcard-id',
          isCorrect: false,
        })
        .expect(200);

      const editedFlashcard = await flashcardRepository.getById('flashcard-id');
      expect(editedFlashcard.partitionId).toEqual(zeBox.partitions[0].id);
    });
  });
});
