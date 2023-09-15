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
    readonly archivedPartition: Partition,
  ) {}

  static emptyBoxOfId(id: string) {
    return new Box(
      id,
      [
        new Partition(`${id}-1`),
        new Partition(`${id}-2`),
        new Partition(`${id}-3`),
        new Partition(`${id}-4`),
        new Partition(`${id}-5`),
      ],
      new Partition(`${id}-archive`),
    );
  }

  addNewFlashcard(flashcardData: { id: string; front: string; back: string }) {
    return new Flashcard(
      flashcardData.id,
      flashcardData.front,
      flashcardData.back,
      this.partitions[0].id,
    );
  }

  public handleFlashcardAnswer(
    flashcard: Flashcard,
    { isCorrect, reviewDate }: { isCorrect: boolean; reviewDate: Date },
  ) {
    if (isCorrect) {
      return this.putFlashcardInNextPartition(flashcard, reviewDate);
    }

    return this.putFlashcardInPreviousPartition(flashcard, reviewDate);
  }

  private putFlashcardInNextPartition(flashcard: Flashcard, reviewDate: Date) {
    const actualPartitionNumber = this.partitions.findIndex(
      (partition) => partition.id === flashcard.partitionId,
    );
    if (actualPartitionNumber === 4) {
      return flashcard.putInPartition(this.archivedPartition.id, reviewDate);
    }
    return flashcard.putInPartition(
      this.partitions[actualPartitionNumber + 1].id,
      reviewDate,
    );
  }

  private putFlashcardInPreviousPartition(
    flashcard: Flashcard,
    reviewDate: Date,
  ) {
    const actualPartitionNumber = this.partitions.findIndex(
      (partition) => partition.id === flashcard.partitionId,
    );
    return flashcard.putInPartition(
      this.partitions[actualPartitionNumber - 1].id,
      reviewDate,
    );
  }
}
