export class Flashcard {
  constructor(
    readonly id: string,
    readonly front: string,
    readonly back: string,
    readonly partitionId: string,
    readonly lastReviewedAt?: Date,
    readonly flashcard1Id?: string,
    readonly flashcard2Id?: string,
  ) {}

  putInPartition(partitionId: string, lastReviewedAt: Date): Flashcard {
    return new Flashcard(
      this.id,
      this.front,
      this.back,
      partitionId,
      lastReviewedAt,
      this.flashcard1Id,
      this.flashcard2Id,
    );
  }
}
