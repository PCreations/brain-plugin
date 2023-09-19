import { Controller, Get, Req } from '@nestjs/common';
import { GetNextCardToReview } from './get-next-card-to-review.query';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('api/flashcard')
export class GetNextCardToReviewController {
  constructor(private readonly getNextCardToReview: GetNextCardToReview) {}

  @ApiOperation({
    description:
      'Retrieve the next card to review. Show ONLY the front of the card, then ask the user to find the back of the card, and only then show the back of the card while telling the user if their answer was incomplete, incorrect, or correct. Ask the user whether they think they answered correctly or not',
  })
  @Get('get-next-card-to-review')
  async getNextCard(@Req() req) {
    return this.getNextCardToReview.execute({ userId: req.user.uid });
  }
}
