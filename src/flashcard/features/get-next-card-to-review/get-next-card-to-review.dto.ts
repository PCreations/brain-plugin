import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class ReviewableFlashcardDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  front: string;

  @ApiProperty()
  back: string;
}

@ApiExtraModels(ReviewableFlashcardDto)
export class GetNextCardToReviewDto {
  @ApiProperty({
    oneOf: [
      {
        $ref: getSchemaPath(ReviewableFlashcardDto),
      },
      {
        type: 'NO_FLASHCARD_TO_REVIEW',
      },
    ],
  })
  flashcard: ReviewableFlashcardDto | 'NO_FLASHCARD_TO_REVIEW';
}
