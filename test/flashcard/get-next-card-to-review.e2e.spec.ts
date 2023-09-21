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
import {
  WithinPrismaTransaction,
  createWithinPrismaTransaction,
} from 'src/flashcard/infra/within-prisma-transaction';

describe('Feature: Getting the next flashcard to review', () => {
  let app: NestFastifyApplication;
  let flashcardRepository: FlashcardRepository;
  let boxRepository: BoxRepository;
  let userBox: Box;
  let withinPrismaTransaction: WithinPrismaTransaction;
  const testEnv = createTestEnv();
  beforeAll(async () => {
    await testEnv.setUp();
    withinPrismaTransaction = createWithinPrismaTransaction(
      testEnv.prismaClient,
    );
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
    await withinPrismaTransaction((trx) => boxRepository.save(userBox)(trx));
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
        data: {
          flashcard: 'NO_FLASHCARD_TO_REVIEW',
        },
      }),
    );
  });

  test('/api/flashcard/get-next-card-to-review (GET)', async () => {
    await withinPrismaTransaction((trx) =>
      flashcardRepository.save(
        flashcardBuilder()
          .ofId('flashcard-id')
          .withContent({ front: 'front', back: 'back' })
          .inPartition(1)
          .withinBox(userBox)
          .build(),
      )(trx),
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
        data: {
          flashcard: {
            id: 'flashcard-id',
            front: 'front',
            back: 'back',
          },
        },
      }),
    );
  });

  test('/api/flashcard/get-next-card-to-review (GET) : the card to review is a connected cards', async () => {
    await withinPrismaTransaction((trx) => {
      return Promise.all([
        flashcardRepository.save(
          flashcardBuilder()
            .ofId('flashcard1-id')
            .withContent({ front: 'front1', back: 'back1' })
            .inPartition(2)
            .withinBox(userBox)
            .build(),
        )(trx),
        flashcardRepository.save(
          flashcardBuilder()
            .ofId('flashcard2-id')
            .withContent({ front: 'front2', back: 'back2' })
            .inPartition(2)
            .withinBox(userBox)
            .build(),
        )(trx),
        flashcardRepository.save(
          flashcardBuilder()
            .ofId('flashcard-id')
            .withContent({
              front: 'connection 1 & 2',
              back: 'connection 1 & 2 explanation',
            })
            .inPartition(1)
            .connectedTo({
              flashcard1: 'flashcard1-id',
              flashcard2: 'flashcard2-id',
            })
            .withinBox(userBox)
            .build(),
        )(trx),
      ]);
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/flashcard/get-next-card-to-review',
      headers: {
        authorization: `Bearer ${StubAuthenticationGateway.BOB_TEST_TOKEN_AND_UID}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      data: {
        flashcard: {
          id: 'flashcard-id',
          front: 'connection 1 & 2',
          back: 'connection 1 & 2 explanation',
        },
        connectedFlashcards: [
          {
            id: 'flashcard1-id',
            front: 'front1',
            back: 'back1',
          },
          {
            id: 'flashcard2-id',
            front: 'front2',
            back: 'back2',
          },
        ],
      },
    });
  });
});
