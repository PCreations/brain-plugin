import { Body, Controller, Post } from '@nestjs/common';
import { CreateFlashcard } from './create-flashcard.usecase';
import { CreateFlashcardDto } from './create-flashcard.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('api/flashcard')
export class CreateFlashcardController {
  constructor(private readonly createFlashcard: CreateFlashcard) {}

  @ApiOperation({
    description:
      'Use this endpoint to create a flashcard composed of a front representing a concept, and a back containing the definition of this concept. Generate a uuid v4 as the flashcard id',
  })
  @Post('create')
  async create(@Body() createFlashcardDto: CreateFlashcardDto) {
    await this.createFlashcard.execute(createFlashcardDto);
  }
}
