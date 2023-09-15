import { PrismaTestingHelper } from '@chax-at/transactional-prisma-testing';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from 'src/app.module';
import { configureApp } from 'src/main';
import * as request from 'supertest';
import { PrismaService } from 'src/flashcard/infra/prisma.service';
import { BoxRepository } from 'src/flashcard/model/box.repository';
import { FlashcardRepository } from 'src/flashcard/model/flashcard.repository';

describe('Feature: Creating a flashcard', () => {
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

  test('/api/flashcard/create (POST)', async () => {
    const zeBox = await boxRepository.getById('ze-box');
    await request(app.getHttpServer())
      .post('/api/flashcard/create')
      .send({
        id: 'flashcard-id',
        front: 'Some other concept',
        back: 'Some other concept definition',
      })
      .expect(201);

    const savedFlashcard = await flashcardRepository.getById('flashcard-id');

    expect(savedFlashcard).toEqual({
      id: 'flashcard-id',
      front: 'Some other concept',
      back: 'Some other concept definition',
      partitionId: zeBox.partitions[0].id,
    });
  });
});
