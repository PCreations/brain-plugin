import { Tool } from 'langchain/tools';
import { z } from 'zod';
import { CreateFlashcard } from './create-flashcard.usecase';

const inputSchema = z.object({
  front: z.string(),
  back: z.string(),
  id: z.string(),
});

type InputSchema = z.infer<typeof inputSchema>;

export class CreateFlashcardAiToolController extends Tool {
  static lc_name() {
    return 'CreateFlashcard';
  }

  get lc_namespace() {
    return [...super.lc_namespace, 'CreateFlashcard'];
  }

  name = 'CreateFlashcard';
  description =
    'Usefull when the user wants to create a flashcard composed of a front representing a concept, and a back containing the definition of this concept. The input to this tool should be a json string containing a "front" string, and "back" string and an "id" uuid. You MUST preview the flashcard to the user before creating it.';

  constructor(
    private readonly createFlashcard: CreateFlashcard,
    private readonly userId: string,
  ) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    const parsedInput: InputSchema = inputSchema.parse(JSON.parse(input));

    await this.createFlashcard.execute({
      front: parsedInput.front,
      back: parsedInput.back,
      id: parsedInput.id,
      userId: this.userId,
    });

    return '';
  }
}
