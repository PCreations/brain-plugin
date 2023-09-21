export const WithinTransaction = Symbol('WithinTransaction');

export interface WithinTransaction {
  <T>(runInTransaction: (trx: any) => Promise<T>): Promise<T>;
}

export class NullTransaction {}

export const createWithinNullTransaction =
  (): WithinTransaction => (updateFn) =>
    updateFn(new NullTransaction());
