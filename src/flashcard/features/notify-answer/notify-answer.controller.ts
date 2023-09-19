import { Body, Controller, Put, Req } from '@nestjs/common';
import { NotifyAnswer } from './notify-answer.usecase';
import { NotifyAnswerDto } from './notify-answer.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('api/flashcard')
export class NotifyAnswerController {
  constructor(private readonly notifyAnswer: NotifyAnswer) {}

  @ApiOperation({
    description:
      'Use this endpoint to notify the answer the user has given to a specific flashcard in order this flashcard to be moved in the appropriate partition in the user box',
  })
  @Put('notify-answer')
  async notifyFlashcardAnswer(
    @Body() notifyAnswerDto: NotifyAnswerDto,
    @Req() req,
  ) {
    return this.notifyAnswer.execute({
      flashcardId: notifyAnswerDto.flashcardId,
      isCorrect: notifyAnswerDto.isCorrect,
      userId: req.user.uid,
    });
  }
}
