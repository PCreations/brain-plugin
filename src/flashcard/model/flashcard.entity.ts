export class Flashcard {
  constructor(
    readonly id: string,
    readonly front: string,
    readonly back: string,
    readonly partitionId: string,
    readonly lastReviewedAt?: Date,
  ) {}

  putInPartition(partitionId: string, lastReviewedAt: Date): Flashcard {
    return new Flashcard(
      this.id,
      this.front,
      this.back,
      partitionId,
      lastReviewedAt,
    );
  }
}
