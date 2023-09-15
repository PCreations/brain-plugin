import { Box } from '../model/box.entity';
import { BoxRepository } from '../model/box.repository';

export class InMemoryBoxRepository implements BoxRepository {
  private readonly boxesById = new Map<string, Box>();

  getById(boxId: string): Promise<Box> {
    const box = this.boxesById.get(boxId);
    if (box) {
      return Promise.resolve(box);
    }
    throw new Error(`Box with id ${boxId} not found`);
  }

  save(box: Box): Promise<void> {
    this.boxesById.set(box.id, box);

    return Promise.resolve();
  }
}
