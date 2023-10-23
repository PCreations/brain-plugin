import { Tool } from 'langchain/tools';
import { GetNextCardToReview } from './get-next-card-to-review.query';
import { BaseChatMemory } from 'langchain/memory';

export class GetNextCardToReviewAiToolController extends Tool {
  static lc_name() {
    return 'GetNextCardToReviewAiToolController';
  }

  get lc_namespace() {
    return [...super.lc_namespace, 'GetNextCardToReviewAiToolController'];
  }

  name = 'GetNextCardToReviewAiToolController';
  description =
    'Retrieve the next card to review. Show ONLY the front of the card, then ask the user to find the back of the card, and only then show the back of the card while telling the user if their answer was incomplete, incorrect, or correct. If there are connected flashcard, compare the answer to the flashcard back and the connected flashcards back. You MUST Ask the user whether they think they answered correctly, and after you MUST notify the system about the answer';

  constructor(
    private readonly getNextCardToReview: GetNextCardToReview,
    private readonly authUserId: string,
    private readonly memory: BaseChatMemory,
  ) {
    super();
  }

  protected async _call(): Promise<string> {
    const getNextCardToReviewDto = await this.getNextCardToReview.execute({
      userId: this.authUserId,
    });
    if (getNextCardToReviewDto.data.flashcard !== 'NO_FLASHCARD_TO_REVIEW') {
      await this.memory.saveContext(
        {
          input: `The current id of the flashcard I am reviewing is ${getNextCardToReviewDto.data.flashcard.id}`,
        },
        {
          output: 'Ok I will use this id for when notifying your response',
        },
      );
    }
    return JSON.stringify(getNextCardToReviewDto);
  }
}
