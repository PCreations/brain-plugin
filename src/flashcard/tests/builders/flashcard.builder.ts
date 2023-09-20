import {
  PartitionNumber,
  ReviewableFlashcard,
} from 'src/flashcard/features/get-next-card-to-review/get-next-card';
import { Box } from 'src/flashcard/model/box.entity';
import { Flashcard } from 'src/flashcard/model/flashcard.entity';

export const flashcardBuilder = ({
  box = Box.emptyBoxOfIdForUser('test-box-id', 'test-user-id'),
  id = 'test-flashcard-id',
  front = 'some concept',
  back = 'some concept definition',
  partitionNumber = 1,
  isArchived = false,
  flashcard1Id = undefined,
  flashcard2Id = undefined,
  reviewedAt,
}: {
  box?: Box;
  id?: string;
  front?: string;
  back?: string;
  partitionNumber?: PartitionNumber;
  isArchived?: boolean;
  flashcard1Id?: string;
  flashcard2Id?: string;
  reviewedAt?: Date;
} = {}) => {
  const props = {
    box,
    id,
    front,
    back,
    partitionNumber,
    isArchived,
    flashcard1Id,
    flashcard2Id,
    reviewedAt,
  };

  return {
    withinBox(_box: Box) {
      return flashcardBuilder({
        ...props,
        box: _box,
      });
    },
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
    archived() {
      return flashcardBuilder({
        ...props,
        isArchived: true,
      });
    },
    inPartition(_partitionNumber: PartitionNumber) {
      return flashcardBuilder({
        ...props,
        partitionNumber: _partitionNumber,
      });
    },
    lastReviewed(_reviewedAt: Date) {
      return flashcardBuilder({
        ...props,
        reviewedAt: _reviewedAt,
      });
    },
    connectedTo(connection: { flashcard1: string; flashcard2: string }) {
      return flashcardBuilder({
        ...props,
        flashcard1Id: connection.flashcard1,
        flashcard2Id: connection.flashcard2,
      });
    },
    build() {
      return new Flashcard(
        props.id,
        props.front,
        props.back,
        props.isArchived
          ? box.archivedPartition.id
          : box.partitions[props.partitionNumber - 1].id,
        props.reviewedAt,
        props.flashcard1Id,
        props.flashcard2Id,
      );
    },
    buildAsReviewableFlashcard(): ReviewableFlashcard {
      return {
        id: props.id,
        front: props.front,
        back: props.back,
        lastReviewedAt: props.reviewedAt,
        partitionNumber: props.partitionNumber,
        connectedFlashcards:
          props.flashcard1Id && props.flashcard2Id
            ? [
                flashcardBuilder()
                  .ofId(props.flashcard1Id)
                  .buildAsReviewableFlashcard(),
                flashcardBuilder()
                  .ofId(props.flashcard2Id)
                  .buildAsReviewableFlashcard(),
              ]
            : undefined,
      };
    },
  };
};
