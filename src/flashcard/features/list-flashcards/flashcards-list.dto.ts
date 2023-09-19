import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class FlashcardDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  front: string;

  @ApiProperty()
  back: string;
}

@ApiExtraModels(FlashcardDto)
export class FlashcardsListDto {
  flashcards: FlashcardDto[];
}
