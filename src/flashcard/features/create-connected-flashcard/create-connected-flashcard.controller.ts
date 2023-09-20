import { Body, Controller, Post, Req } from '@nestjs/common';
import { CreateConnectedFlashcard } from './create-connected-flashcard.usecase';
import { CreateConnectedFlashcardDto } from './create-connected-flashcard.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('api/flashcard')
export class CreateConnectedFlashcardController {
  constructor(
    private readonly createConnectedFlashcard: CreateConnectedFlashcard,
  ) {}

  @ApiOperation({
    description:
      'Use this endpoint to create a connected flashcard composed of a front representing the connection between two flashcards, and a back containing the explanation of the connection between those flashcards concepts. Generate a uuid v4 as the flashcard id',
  })
  @Post('create-connected')
  async createConnected(
    @Body() createConnectedFlashcardDto: CreateConnectedFlashcardDto,
    @Req() req,
  ) {
    await this.createConnectedFlashcard.execute({
      id: createConnectedFlashcardDto.id,
      front: createConnectedFlashcardDto.front,
      back: createConnectedFlashcardDto.back,
      userId: req.user.uid,
      flashcard1Id: createConnectedFlashcardDto.flashcard1Id,
      flashcard2Id: createConnectedFlashcardDto.flashcard2Id,
    });
  }
}
