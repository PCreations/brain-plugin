import { Tool } from 'langchain/tools';
import { NotifyAnswer } from './notify-answer.usecase';
import { z } from 'zod';

const inputSchema = z.object({
  flashcardId: z.string(),
  isCorrect: z.boolean(),
});

type InputSchema = z.infer<typeof inputSchema>;

export class NotifyAnswerAiToolController extends Tool {
  static lc_name() {
    return 'NotifyAnswer';
  }

  get lc_namespace() {
    return [...super.lc_namespace, 'NotifyAnswer'];
  }

  name = 'NotifyAnswer';
  description =
    'Usefull when the user have just answered a flashcard to notify the system that they correctly answered or not so the flashcard can be moved in appropriate partition in the box. input should be a json string containing the "flashcardId" string, and "isCorrect" boolean. After notifying the answer, you should retrieve the next flashcard to review.';

  constructor(
    private readonly notifyAnswer: NotifyAnswer,
    private readonly userId: string,
  ) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    const parsedInput: InputSchema = inputSchema.parse(JSON.parse(input));
    await this.notifyAnswer.execute({
      flashcardId: parsedInput.flashcardId,
      isCorrect: parsedInput.isCorrect,
      userId: this.userId,
    });
    return '';
  }
}
