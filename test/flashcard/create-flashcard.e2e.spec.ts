import { PrismaTestingHelper } from '@chax-at/transactional-prisma-testing';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from 'src/app.module';
import { configureApp } from 'src/configure-app';
import { PrismaService } from 'src/flashcard/infra/prisma.service';
import { BoxRepository } from 'src/flashcard/model/box.repository';
import { FlashcardRepository } from 'src/flashcard/model/flashcard.repository';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

describe('Feature: Creating a flashcard', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let prismaTestingHelper: PrismaTestingHelper<PrismaService> | undefined;
  let flashcardRepository: FlashcardRepository;
  let boxRepository: BoxRepository;

  beforeAll(async () => {
    if (prismaTestingHelper == null) {
      const originalPrismaService = new PrismaService();
      prismaTestingHelper = new PrismaTestingHelper(originalPrismaService);
      prisma = prismaTestingHelper.getProxyClient();
    }
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
    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await configureApp(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(async () => {
    await prismaTestingHelper.startNewTransaction({
      timeout: 30000,
    });
  });

  afterEach(async () => {
    prismaTestingHelper?.rollbackCurrentTransaction();
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
      lastReviewedAt: null, // TODO Fixme
    });
  });
});
