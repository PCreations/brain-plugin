import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class NotifyAnswerDto {
  @IsString()
  @IsNotEmpty()
  flashcardId: string;

  @IsBoolean()
  @IsNotEmpty()
  isCorrect: boolean;
}
