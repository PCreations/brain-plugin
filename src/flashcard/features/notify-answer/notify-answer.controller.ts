import { Controller, Put } from '@nestjs/common';

@Controller('api/flashcard')
export class NotifyAnswerController {
  constructor() {}
  @Put('notify-answer')
  async create() {
    return '';
  }
}
