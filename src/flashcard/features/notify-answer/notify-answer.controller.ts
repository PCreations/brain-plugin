import { Body, Controller, Put } from '@nestjs/common';
import { NotifyAnswer } from './notify-answer.usecase';
import { NotifyAnswerDto } from './notify-answer.dto';

@Controller('api/flashcard')
export class NotifyAnswerController {
  constructor(private readonly notifyAnswer: NotifyAnswer) {}

  @Put('notify-answer')
  async notifyFlashcardAnswer(@Body() notifyAnswerDto: NotifyAnswerDto) {
    return this.notifyAnswer.execute({
      flashcardId: notifyAnswerDto.flashcardId,
      isCorrect: notifyAnswerDto.isCorrect,
    });
  }
}
