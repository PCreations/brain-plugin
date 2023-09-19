import { INestApplication, ValidationPipe } from '@nestjs/common';

export const configureApp = async (app: INestApplication) => {
  app.enableCors({
    origin: '*',
  });
  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();
};
