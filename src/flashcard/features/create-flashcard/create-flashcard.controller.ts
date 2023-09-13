import { Body, Controller, Post } from '@nestjs/common';
import { CreateFlashcard } from './create-flashcard.usecase';
import { CreateFlashcardDto } from './create-flashcard.dto';

@Controller('api/flashcard')
export class CreateFlashcardController {
  constructor(private readonly createFlashcard: CreateFlashcard) {}
  @Post('create')
  async create(@Body() createFlashcardDto: CreateFlashcardDto) {
    await this.createFlashcard.execute(createFlashcardDto);
  }
}
