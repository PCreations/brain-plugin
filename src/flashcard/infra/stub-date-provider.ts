import { DateProvider } from '../model/date-provider';

export class StubDateProvider implements DateProvider {
  now: Date;
  getNow(): Date {
    return this.now;
  }
}
