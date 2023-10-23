import { Tool } from 'langchain/tools';
import { ListFlashcards } from './list-flashcards.query';
import { BaseMemory } from 'langchain/memory';

export class ListFlashcardsAiToolController extends Tool {
  static lc_name() {
    return 'ListFlashcards';
  }

  get lc_namespace() {
    return [...super.lc_namespace, 'ListFlashcards'];
  }

  name = 'ListFlashcards';
  description =
    'Usefull for retrieving all the user flashcards when they want to know if they already have some flashcards about some specific subjects, or to use all the flashcards to suggest connection between flashcards based on their content';

  constructor(
    private readonly listFlashcards: ListFlashcards,
    private readonly userId: string,
    private readonly memory: BaseMemory,
  ) {
    super();
  }

  protected async _call(): Promise<string> {
    const flashcards = await this.listFlashcards.execute({
      userId: this.userId,
    });

    await this.memory.saveContext(
      {
        input: `Here are my actual flashcards in a JSON format : ${JSON.stringify(
          flashcards,
        )}`,
      },
      {
        output:
          'Ok. I will suggest some connected flashcards based on your flashcards content when you ask me to do so',
      },
    );

    return JSON.stringify(flashcards);
  }
}
