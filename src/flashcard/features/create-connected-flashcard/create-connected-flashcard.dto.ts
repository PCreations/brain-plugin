import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConnectedFlashcardDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  front: string;

  @IsString()
  @IsNotEmpty()
  back: string;

  @IsString()
  @IsNotEmpty()
  flashcard1Id: string;

  @IsString()
  @IsNotEmpty()
  flashcard2Id: string;
}
