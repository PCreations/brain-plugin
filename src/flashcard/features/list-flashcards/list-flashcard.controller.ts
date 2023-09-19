import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ListFlashcards } from './list-flashcards.query';

@ApiBearerAuth()
@Controller('api/flashcard')
export class ListFlashcardsController {
  constructor(private readonly listFlashcards: ListFlashcards) {}

  @ApiOperation({
    description:
      'Retrieve all the user flashcards, use them to suggest connection between flashcards based on their content',
  })
  @Get('list-flashcards')
  async listCards(@Req() req) {
    return this.listFlashcards.execute({ userId: req.user.uid });
  }
}
