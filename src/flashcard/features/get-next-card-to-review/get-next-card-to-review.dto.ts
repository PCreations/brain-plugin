export class GetNextCardToReviewDto {
  flashcard:
    | {
        id: string;
        front: string;
        back: string;
      }
    | 'NO_FLASHCARD_TO_REVIEW';
}
