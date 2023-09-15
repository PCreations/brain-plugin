import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { FlashcardRepository } from 'src/flashcard/model/flashcard.repository';
import { configureApp } from 'src/main';
import * as request from 'supertest';
import { InMemoryFlashcardRepository } from 'src/flashcard/infra/inmemory-flashcard.repository';

describe('Feature: Notifying a good answer to a flashcard', () => {
  let app: INestApplication;
  const flashcardRepository = new InMemoryFlashcardRepository();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FlashcardRepository)
      .useValue(flashcardRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(() => app.close());

  describe('Example: The flashcard is in the first partition', () => {
    test('/api/flashcard/notify-answer (PUT) - the correct answer is given thus the flashcard should be in the second partition', async () => {
      await flashcardRepository.save({
        id: 'flashcard-id',
        front: 'some concept',
        back: 'some concept definition',
      });
      // todo : put the flashcard in the first partition (of what ?)
      await request(app.getHttpServer())
        .put('/api/flashcard/notify-answer')
        .send({
          flashcardId: 'flashcard-id',
          isCorrect: true,
        })
        .expect(200);

      throw new Error('expect flashcard to be in partition 2');
    });
  });
});
