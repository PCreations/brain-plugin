import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaService } from '../src/flashcard/infra/prisma.service';

const asyncExec = promisify(exec);

export const createTestEnv = () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaService;

  return {
    async setUp() {
      container = await new PostgreSqlContainer()
        .withDatabase('brain-test')
        .withUsername('brain-test')
        .withPassword('brain-test')
        .withExposedPorts(5432)
        .start();
      const databaseUrl = `postgresql://brain-test:brain-test@${container.getHost()}:${container.getMappedPort(
        5432,
      )}/brain-test?schema=public`;
      prismaClient = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      }) as PrismaService;
      await asyncExec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`);

      await prismaClient.$connect();
    },
    async tearDown() {
      await container.stop({ timeout: 1000 });
      return prismaClient.$disconnect();
    },
    get prismaClient() {
      return prismaClient;
    },
  };
};
