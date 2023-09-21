import { Injectable } from '@nestjs/common';
import { Box } from './box.entity';

@Injectable()
export abstract class BoxRepository {
  abstract save(box: Box): (trx: any) => Promise<void>;
  abstract getById(id: string): (trx: any) => Promise<Box>;
  abstract getByUserId(userId: string): (trx: any) => Promise<Box>;
  abstract getNextBoxId(): string;
}
