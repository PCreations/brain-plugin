import { Flashcard } from './flashcard.entity';

export class Partition {
  constructor(readonly id: string) {}
}

export class Box {
  constructor(
    readonly id: string,
    readonly partitions: [
      Partition,
      Partition,
      Partition,
      Partition,
      Partition,
    ],
  ) {}

  static emptyBoxOfId(id: string) {
    return new Box(id, [
      new Partition(`${id}-1`),
      new Partition(`${id}-2`),
      new Partition(`${id}-3`),
      new Partition(`${id}-4`),
      new Partition(`${id}-5`),
    ]);
  }

  addNewFlashcard(flashcardData: { id: string; front: string; back: string }) {
    return new Flashcard(
      flashcardData.id,
      flashcardData.front,
      flashcardData.back,
      this.partitions[0].id,
    );
  }

  putFlashcardInNextPartition(flashcard: Flashcard) {
    const actualPartitionNumber = this.partitions.findIndex(
      (partition) => partition.id === flashcard.partitionId,
    );
    return flashcard.putInPartition(
      this.partitions[actualPartitionNumber + 1].id,
    );
  }
}
