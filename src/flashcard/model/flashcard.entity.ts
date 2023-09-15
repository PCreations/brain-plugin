export class Flashcard {
  constructor(
    readonly id: string,
    readonly front: string,
    readonly back: string,
    readonly partitionId: string,
  ) {}

  putInPartition(partitionId: string): Flashcard {
    return new Flashcard(this.id, this.front, this.back, partitionId);
  }
}
