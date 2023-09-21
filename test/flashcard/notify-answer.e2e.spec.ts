import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { FlashcardRepository } from 'src/flashcard/model/flashcard.repository';
import { configureApp } from 'src/configure-app';
import { BoxRepository } from 'src/flashcard/model/box.repository';
import { flashcardBuilder } from 'src/flashcard/tests/builders/flashcard.builder';
import { StubDateProvider } from 'src/flashcard/infra/stub-date-provider';
import { DateProvider } from 'src/flashcard/model/date-provider';
import { createTestEnv } from '../../src/test.env';
import { PrismaService } from 'src/flashcard/infra/prisma.service';
import { Box } from 'src/flashcard/model/box.entity';
import { StubAuthenticationGateway } from 'src/auth/stub-authentication.gateway';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  WithinPrismaTransaction,
  createWithinPrismaTransaction,
} from 'src/flashcard/infra/within-prisma-transaction';
import { WithinTransaction } from 'src/flashcard/model/within-transaction';

describe('Feature: Notifying a good answer to a flashcard', () => {
  const today = new Date('2023-09-15T17:45:00.000Z');
  let userBox: Box;
  let app: NestFastifyApplication;
  let flashcardRepository: FlashcardRepository;
  let boxRepository: BoxRepository;
  const stubDateProvider = new StubDateProvider();
  stubDateProvider.now = today;
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
      .overrideProvider(DateProvider)
      .useValue(stubDateProvider)
      .compile();
    boxRepository = moduleFixture.get<BoxRepository>(BoxRepository);
    flashcardRepository =
      moduleFixture.get<FlashcardRepository>(FlashcardRepository);
    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await configureApp(app);
    await app.init();
    userBox = Box.emptyBoxOfIdForUser(
      'box-id',
      StubAuthenticationGateway.BOB_TEST_TOKEN_AND_UID,
    );
    await withinPrismaTransaction((trx) => boxRepository.save(userBox)(trx));
  });

  afterAll(() => app.close());

  describe('Example: The flashcard is in the first partition', () => {
    test('/api/flashcard/notify-answer (PUT) - the correct answer is given thus the flashcard should be in the second partition', async () => {
      await withinPrismaTransaction((trx) =>
        flashcardRepository.save(
          flashcardBuilder()
            .ofId('flashcard-id')
            .inPartition(1)
            .withinBox(userBox)
            .build(),
        )(trx),
      );

      await app.inject({
        method: 'PUT',
        url: '/api/flashcard/notify-answer',
        headers: {
          authorization: `Bearer ${StubAuthenticationGateway.BOB_TEST_TOKEN_AND_UID}`,
        },
        body: {
          flashcardId: 'flashcard-id',
          isCorrect: true,
        },
      });

      const editedFlashcard = await withinPrismaTransaction((trx) =>
        flashcardRepository.getById('flashcard-id')(trx),
      );
      expect(editedFlashcard.partitionId).toEqual(userBox.partitions[1].id);
      expect(editedFlashcard.lastReviewedAt).toEqual(today);
    });
  });

  describe('Example: The flashcard is in the second partition', () => {
    test('/api/flashcard/notify-answer (PUT) - the wrong answer is given thus the flashcard should be in the first partition', async () => {
      await withinPrismaTransaction((trx) =>
        flashcardRepository.save(
          flashcardBuilder()
            .ofId('flashcard-id')
            .inPartition(2)
            .withinBox(userBox)
            .build(),
        )(trx),
      );

      await app.inject({
        method: 'PUT',
        url: '/api/flashcard/notify-answer',
        headers: {
          authorization: `Bearer ${StubAuthenticationGateway.BOB_TEST_TOKEN_AND_UID}`,
        },
        body: {
          flashcardId: 'flashcard-id',
          isCorrect: false,
        },
      });

      const editedFlashcard = await withinPrismaTransaction((trx) =>
        flashcardRepository.getById('flashcard-id')(trx),
      );
      expect(editedFlashcard.partitionId).toEqual(userBox.partitions[0].id);
    });
  });
});
