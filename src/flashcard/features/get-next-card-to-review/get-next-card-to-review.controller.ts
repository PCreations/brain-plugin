import { Controller, Get } from '@nestjs/common';
import { GetNextCardToReview } from './get-next-card-to-review.query';

@Controller('api/flashcard')
export class GetNextCardToReviewController {
  constructor(private readonly getNextCardToReview: GetNextCardToReview) {}

  @Get('get-next-card-to-review')
  async getNextCard() {
    return this.getNextCardToReview.execute({ boxId: 'ze-box' });
  }
}
