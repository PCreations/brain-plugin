import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { BoxRepository } from './flashcard/model/box.repository';
import { Box } from './flashcard/model/box.entity';

export const configureApp = async (app: INestApplication<unknown>) => {
  app.enableCors({
    origin: '*',
  });
  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();
  const boxRepository = app.get<BoxRepository>(BoxRepository);
  await boxRepository.save(Box.emptyBoxOfId('ze-box'));
};

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await configureApp(app);
  const config = new DocumentBuilder()
    .setTitle('BrAIn API')
    .setDescription('Create flashcards and review them with spaced-repition.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: 'openapi.json',
  });

  await app.listen(process.env.PORT || 3002, '0.0.0.0');
}

bootstrap();
