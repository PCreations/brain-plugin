import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class ReviewableFlashcardDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  front: string;

  @ApiProperty()
  back: string;
}

export class GetNextCardToReviewFlashcardResponse {
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

export class GetNextCardToReviewConnectedFlashcardResponse {
  @ApiProperty()
  flashcard: ReviewableFlashcardDto;

  @ApiProperty({
    type: [ReviewableFlashcardDto],
  })
  connectedFlashcards: ReviewableFlashcardDto[];
}

@ApiExtraModels(
  GetNextCardToReviewFlashcardResponse,
  GetNextCardToReviewConnectedFlashcardResponse,
)
export class GetNextCardToReviewDto {
  @ApiProperty({
    oneOf: [
      {
        $ref: getSchemaPath(GetNextCardToReviewFlashcardResponse),
      },
      {
        $ref: getSchemaPath(GetNextCardToReviewConnectedFlashcardResponse),
      },
    ],
  })
  data:
    | GetNextCardToReviewFlashcardResponse
    | GetNextCardToReviewConnectedFlashcardResponse;
}
