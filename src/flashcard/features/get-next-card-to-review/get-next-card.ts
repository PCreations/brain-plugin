import { subDays } from 'date-fns';

export type PartitionNumber = 1 | 2 | 3 | 4 | 5;

export type ReviewableFlashcard = {
  id: string;
  front: string;
  back: string;
  lastReviewedAt?: Date;
  partitionNumber: PartitionNumber;
};

enum Interval {
  EveryDay = 1,
  EveryThreeDays = 3,
  TwiceAweek = 4,
  TwiceAmonth = 15,
  OnceAmonth = 30,
}

const reviewIntervalByPartition: {
  [partitionNumber in PartitionNumber]: Interval;
} = {
  1: Interval.EveryDay,
  2: Interval.EveryThreeDays,
  3: Interval.TwiceAweek,
  4: Interval.TwiceAmonth,
  5: Interval.OnceAmonth,
};

const shouldCardBeReviewed =
  (now: Date) => (flashcard: ReviewableFlashcard) => {
    if (
      flashcard.partitionNumber === 1 &&
      flashcard.lastReviewedAt === undefined
    )
      return true;

    return (
      subDays(now, reviewIntervalByPartition[flashcard.partitionNumber]) >=
      flashcard.lastReviewedAt
    );
  };

const sortFlashcardByLastReviewedAtDesc = (
  f1: ReviewableFlashcard,
  f2: ReviewableFlashcard,
) => {
  if (!f1.lastReviewedAt || !f2.lastReviewedAt) return 0;
  return f2.lastReviewedAt?.getTime() - f1.lastReviewedAt?.getTime();
};

export const getNextCardToReview = ({
  partitions,
  now,
}: {
  partitions: ReviewableFlashcard[];
  now: Date;
}) => {
  partitions.sort(sortFlashcardByLastReviewedAtDesc);

  return partitions.filter(shouldCardBeReviewed(now))[0];
};
