import { Flashcard } from 'src/flashcard/model/flashcard.entity';

export const flashcardBuilder = ({
  id = 'test-flashcard-id',
  front = 'some concept',
  back = 'some concept definition',
  partitionId = 'test-partition-id',
}: {
  id?: string;
  front?: string;
  back?: string;
  partitionId?: string;
} = {}) => {
  const props = {
    id,
    front,
    back,
    partitionId,
  };

  return {
    ofId(_id: string) {
      return flashcardBuilder({
        ...props,
        id: _id,
      });
    },
    withContent(content: { front: string; back: string }) {
      return flashcardBuilder({
        ...props,
        ...content,
      });
    },
    inPartition(_partitionId: string) {
      return flashcardBuilder({
        ...props,
        partitionId: _partitionId,
      });
    },
    build() {
      return new Flashcard(
        props.id,
        props.front,
        props.back,
        props.partitionId,
      );
    },
  };
};
