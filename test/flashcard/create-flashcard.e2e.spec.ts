import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { FlashcardRepository } from 'src/flashcard/model/flashcard.repository';
import { configureApp } from 'src/main';
import * as request from 'supertest';

describe('Feature: Creating a flashcard', () => {
  let app: INestApplication;
  let flashcardRepository: FlashcardRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    flashcardRepository =
      moduleFixture.get<FlashcardRepository>(FlashcardRepository);
    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  test('/api/flashcard/create (POST)', async () => {
    await request(app.getHttpServer())
      .post('/api/flashcard/create')
      .send({
        id: 'flashcard-id',
        front: 'Some concept',
        back: 'Some concept definition',
      })
      .expect(201);
    const savedFlashcard = await flashcardRepository.getById('flashcard-id');

    expect(savedFlashcard).toEqual({
      id: 'flashcard-id',
      front: 'Some concept',
      back: 'Some concept definition',
    });
  });
});
