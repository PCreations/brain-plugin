import { Body, Controller, Put } from '@nestjs/common';
import { NotifyAnswer } from './notify-answer.usecase';
import { NotifyAnswerDto } from './notify-answer.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('api/flashcard')
export class NotifyAnswerController {
  constructor(private readonly notifyAnswer: NotifyAnswer) {}

  @ApiOperation({
    description:
      'Use this endpoint to notify the answer the user has given to a specific flashcard in order this flashcard to be moved in the appropriate partition in the user box',
  })
  @Put('notify-answer')
  async notifyFlashcardAnswer(@Body() notifyAnswerDto: NotifyAnswerDto) {
    return this.notifyAnswer.execute({
      flashcardId: notifyAnswerDto.flashcardId,
      isCorrect: notifyAnswerDto.isCorrect,
    });
  }
}
