import { Tool } from 'langchain/tools';
import { z } from 'zod';
import { CreateConnectedFlashcard } from './create-connected-flashcard.usecase';

const inputSchema = z.object({
  front: z.string(),
  back: z.string(),
  id: z.string(),
  flashcard1Id: z.string(),
  flashcard2Id: z.string(),
});

type InputSchema = z.infer<typeof inputSchema>;

export class CreateConnectedFlashcardAiToolController extends Tool {
  static lc_name() {
    return 'CreateConnectedFlashcard';
  }

  get lc_namespace() {
    return [...super.lc_namespace, 'CreateConnectedFlashcard'];
  }

  name = 'CreateConnectedFlashcard';
  description =
    'Usefull when the user wants to generate some connected flashcards among their existing flashcards. The connected flashcard is composed of a front representing the connection between two flashcards, and a back containing the explanation of the connection between those flashcards concepts. Generate a uuid v4 as the flashcard id';

  constructor(
    private readonly createConnectedFlashcard: CreateConnectedFlashcard,
    private readonly userId: string,
  ) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    const parsedInput: InputSchema = inputSchema.parse(JSON.parse(input));

    await this.createConnectedFlashcard.execute({
      id: parsedInput.id,
      front: parsedInput.front,
      back: parsedInput.back,
      userId: this.userId,
      flashcard1Id: parsedInput.flashcard1Id,
      flashcard2Id: parsedInput.flashcard2Id,
    });

    return '';
  }
}
