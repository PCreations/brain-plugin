import { PrismaService, PrismaTrx } from './prisma.service';

export const createWithinPrismaTransaction =
  (prismaService: PrismaService) =>
  (runInTransaction: (trx: PrismaTrx) => Promise<any>) =>
    prismaService.$transaction(runInTransaction);

export type WithinPrismaTransaction = ReturnType<
  typeof createWithinPrismaTransaction
>;
