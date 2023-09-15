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
