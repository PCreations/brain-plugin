import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';

export const configureApp = (app: INestApplication<unknown>) => {
  app.enableCors({
    origin: '*',
  });
  app.useGlobalPipes(new ValidationPipe());
};

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  configureApp(app);
  const config = new DocumentBuilder()
    .setTitle('BrAIn API')
    .setDescription('Create flashcards and review them with spaced-repition.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: 'openapi.json',
  });

  await app.listen(process.env.PORT || 3002);
}

bootstrap();
