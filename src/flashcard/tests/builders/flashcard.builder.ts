import {
  PartitionNumber,
  ReviewableFlashcard,
} from 'src/flashcard/features/get-next-card';
import { Box } from 'src/flashcard/model/box.entity';
import { Flashcard } from 'src/flashcard/model/flashcard.entity';

export const flashcardBuilder = ({
  box = Box.emptyBoxOfId('test-box-id'),
  id = 'test-flashcard-id',
  front = 'some concept',
  back = 'some concept definition',
  partitionNumber = 1,
  isArchived = false,
  reviewedAt,
}: {
  box?: Box;
  id?: string;
  front?: string;
  back?: string;
  partitionNumber?: PartitionNumber;
  isArchived?: boolean;
  reviewedAt?: Date;
} = {}) => {
  const props = {
    box,
    id,
    front,
    back,
    partitionNumber,
    isArchived,
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
    build() {
      return new Flashcard(
        props.id,
        props.front,
        props.back,
        props.isArchived
          ? box.archivedPartition.id
          : box.partitions[props.partitionNumber - 1].id,
        props.reviewedAt,
      );
    },
    buildAsReviewableFlashcard(): ReviewableFlashcard {
      return {
        id: props.id,
        front: props.front,
        back: props.back,
        lastReviewedAt: props.reviewedAt,
        partitionNumber: props.partitionNumber,
      };
    },
  };
};
