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
import {
  WithinPrismaTransaction,
  createWithinPrismaTransaction,
} from 'src/flashcard/infra/within-prisma-transaction';
import { WithinTransaction } from 'src/flashcard/model/within-transaction';

describe('Feature: Creating a flashcard', () => {
  let app: NestFastifyApplication;
  let flashcardRepository: FlashcardRepository;
  let boxRepository: BoxRepository;
  let userBox: Box;
  const testEnv = createTestEnv();
  let withinPrismaTransaction: WithinPrismaTransaction;

  afterAll(async () => {
    await testEnv.tearDown();
  });

  beforeAll(async () => {
    await testEnv.setUp();
    withinPrismaTransaction = createWithinPrismaTransaction(
      testEnv.prismaClient,
    );
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(testEnv.prismaClient)
      .overridePipe(WithinTransaction)
      .useValue(withinPrismaTransaction)
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
    await withinPrismaTransaction((trx) => boxRepository.save(userBox)(trx));
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

    const savedFlashcard = await withinPrismaTransaction((trx) =>
      flashcardRepository.getById('flashcard-id')(trx),
    );

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
