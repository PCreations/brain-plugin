import { Injectable } from '@nestjs/common';
import { Box } from './box.entity';

@Injectable()
export abstract class BoxRepository {
  abstract save(box: Box): Promise<void>;
  abstract getById(id: string): Promise<Box>;
  abstract getByUserId(userId: string): Promise<Box>;
  abstract getNextBoxId(): string;
}
