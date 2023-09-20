/**
 * Partition 1 every day
 * Partition 2 every 3 days
 * Partition 3 once a week
 * Partition 4 twice a month
 * Partition 5 once a month
 */

import {
  ReviewableFlashcard,
  getNextCardToReview,
} from '../features/get-next-card-to-review/get-next-card';
import { flashcardBuilder } from './builders/flashcard.builder';

const getTestNextCardToReview = ({
  now = new Date(),
  partitions = [],
}: { now?: Date; partitions?: ReviewableFlashcard[] } = {}) => {
  return getNextCardToReview({ partitions, now });
};

describe('Next card to review', () => {
  test('No cards to review : the deck is empty', () => {
    const flashcard = getTestNextCardToReview();

    expect(flashcard).toBeUndefined();
  });

  test('Only one card to review that has not been reviewed before', () => {
    const flashcard = flashcardBuilder()
      .ofId('flashcard-id')
      .inPartition(1)
      .buildAsReviewableFlashcard();

    const flashcardsToReview = getTestNextCardToReview({
      partitions: [flashcard],
    });

    expect(flashcardsToReview).toEqual(flashcard);
  });

  test('Only one connected card to review that has not been reviewed before', () => {
    const flashcard = flashcardBuilder()
      .ofId('flashcard-id')
      .inPartition(1)
      .connectedTo({ flashcard1: 'flashcard1-id', flashcard2: 'flashcard2-id' })
      .buildAsReviewableFlashcard();

    const flashcardsToReview = getTestNextCardToReview({
      partitions: [flashcard],
    });

    expect(flashcardsToReview).toEqual(
      flashcardBuilder()
        .ofId('flashcard-id')
        .inPartition(1)
        .connectedTo({
          flashcard1: 'flashcard1-id',
          flashcard2: 'flashcard2-id',
        })
        .buildAsReviewableFlashcard(),
    );
  });

  test('There is only one card but it has been already reviewed', () => {
    const now = new Date('2023-09-18T12:20:00.000Z');
    const flashcard = flashcardBuilder()
      .ofId('flashcard-id')
      .inPartition(1)
      .lastReviewed(new Date('2023-09-18T11:20:00.000Z'))
      .buildAsReviewableFlashcard();

    const flashcardsToReview = getTestNextCardToReview({
      now,
      partitions: [flashcard],
    });

    expect(flashcardsToReview).toBeUndefined();
  });

  test('There is only one card that has been reviewed but not during the current session (i.e not today)', () => {
    const now = new Date('2023-09-18T12:20:00.000Z');
    const flashcard = flashcardBuilder()
      .ofId('flashcard-id')
      .inPartition(1)
      .lastReviewed(new Date('2023-09-17T12:20:00.000Z'))
      .buildAsReviewableFlashcard();

    const flashcardsToReview = getTestNextCardToReview({
      now,
      partitions: [flashcard],
    });

    expect(flashcardsToReview).toEqual(flashcard);
  });

  describe('There is few cards on the first partition : they must be selected in reverse chronological order of last time reviewed', () => {
    test('Multiple cards not reviewed at all', () => {
      const now = new Date('2023-09-18T12:20:00.000Z');
      const flashcard1 = flashcardBuilder()
        .ofId('flashcard1-id')
        .inPartition(1)
        .buildAsReviewableFlashcard();
      const flashcard2 = flashcardBuilder()
        .ofId('flashcard2-id')
        .buildAsReviewableFlashcard();

      const flashcardsToReview = getTestNextCardToReview({
        now,
        partitions: [flashcard1, flashcard2],
      });

      expect(flashcardsToReview).toEqual(flashcard1);
    });

    test('Multiple cards already reviewed before (but not today)', () => {
      const now = new Date('2023-09-18T12:20:00.000Z');
      const flashcard1 = flashcardBuilder()
        .ofId('flashcard-id')
        .inPartition(1)
        .lastReviewed(new Date('2023-09-17T12:20:00.000Z'))
        .buildAsReviewableFlashcard();
      const flashcard2 = flashcardBuilder()
        .ofId('flashcard-id')
        .inPartition(1)
        .lastReviewed(new Date('2023-09-16T12:20:00.000Z'))
        .buildAsReviewableFlashcard();

      const flashcardsToReview = getTestNextCardToReview({
        now,
        partitions: [flashcard2, flashcard1],
      });

      expect(flashcardsToReview).toEqual(flashcard1);
    });

    test('Multiple cards : some already reviewed before (but not today) and some without review date', () => {
      const now = new Date('2023-09-18T12:20:00.000Z');
      const flashcard1 = flashcardBuilder()
        .ofId('flashcard1-id')
        .inPartition(1)
        .lastReviewed(new Date('2023-09-17T12:20:00.000Z'))
        .buildAsReviewableFlashcard();
      const flashcard2 = flashcardBuilder()
        .ofId('flashcard2-id')
        .inPartition(1)
        .lastReviewed(new Date('2023-09-16T12:20:00.000Z'))
        .buildAsReviewableFlashcard();
      const flashcard3 = flashcardBuilder()
        .ofId('flashcard3-id')
        .inPartition(1)
        .buildAsReviewableFlashcard();

      const flashcardsToReview = getTestNextCardToReview({
        now,
        partitions: [flashcard3, flashcard2, flashcard1],
      });

      expect(flashcardsToReview).toEqual(flashcard3);
    });

    test('Multiple cards : some already reviewed before today but some already reviewed today', () => {
      const now = new Date('2023-09-18T12:20:00.000Z');
      const flashcard1 = flashcardBuilder()
        .ofId('flashcard1-id')
        .inPartition(1)
        .lastReviewed(new Date('2023-09-18T11:20:00.000Z'))
        .buildAsReviewableFlashcard();
      const flashcard2 = flashcardBuilder()
        .ofId('flashcard2-id')
        .lastReviewed(new Date('2023-09-16T12:20:00.000Z'))
        .buildAsReviewableFlashcard();

      const flashcardsToReview = getTestNextCardToReview({
        now,
        partitions: [flashcard1, flashcard2],
      });

      expect(flashcardsToReview).toEqual(flashcard2);
    });
  });

  test('There is one reviewable card, last reviewed two days ago in the second partition => should not be picked', () => {
    const now = new Date('2023-09-18T12:20:00.000Z');
    const flashcard = flashcardBuilder()
      .ofId('flashcard1-id')
      .lastReviewed(new Date('2023-09-16T12:20:00.000Z'))
      .inPartition(2)
      .buildAsReviewableFlashcard();

    const flashcardsToReview = getTestNextCardToReview({
      now,
      partitions: [flashcard],
    });

    expect(flashcardsToReview).toBeUndefined();
  });

  test('There is one reviewable card, last reviewed four days ago in the second partition => should be picked', () => {
    const now = new Date('2023-09-18T12:20:00.000Z');
    const flashcard = flashcardBuilder()
      .ofId('flashcard1-id')
      .lastReviewed(new Date('2023-09-14T12:20:00.000Z'))
      .inPartition(2)
      .buildAsReviewableFlashcard();

    const flashcardsToReview = getTestNextCardToReview({
      now,
      partitions: [flashcard],
    });

    expect(flashcardsToReview).toEqual(flashcard);
  });

  test('Card in third partition should be reviewed twice a week', () => {
    const now = new Date('2023-09-18T12:20:00.000Z');
    {
      const flashcard = flashcardBuilder()
        .ofId('flashcard1-id')
        .lastReviewed(new Date('2023-09-14T12:21:00.000Z'))
        .inPartition(3)
        .buildAsReviewableFlashcard();

      const flashcardsToReview = getTestNextCardToReview({
        now,
        partitions: [flashcard],
      });

      expect(flashcardsToReview).toBeUndefined();
    }
    {
      const flashcard = flashcardBuilder()
        .ofId('flashcard1-id')
        .lastReviewed(new Date('2023-09-13T12:20:00.000Z'))
        .inPartition(3)
        .buildAsReviewableFlashcard();

      const flashcardsToReview = getTestNextCardToReview({
        now,
        partitions: [flashcard],
      });

      expect(flashcardsToReview).toEqual(flashcard);
    }
  });

  test('Card in fourth partition should be reviewed twice a month', () => {
    const now = new Date('2023-09-18T12:20:00.000Z');
    {
      const flashcard = flashcardBuilder()
        .ofId('flashcard1-id')
        .lastReviewed(new Date('2023-09-05T12:21:00.000Z'))
        .inPartition(4)
        .buildAsReviewableFlashcard();

      const flashcardsToReview = getTestNextCardToReview({
        now,
        partitions: [flashcard],
      });

      expect(flashcardsToReview).toBeUndefined();
    }
    {
      const flashcard = flashcardBuilder()
        .ofId('flashcard1-id')
        .lastReviewed(new Date('2023-09-02T12:20:00.000Z'))
        .inPartition(4)
        .buildAsReviewableFlashcard();

      const flashcardsToReview = getTestNextCardToReview({
        now,
        partitions: [flashcard],
      });

      expect(flashcardsToReview).toEqual(flashcard);
    }
  });

  test('Card in fifth partition should be reviewed once a month', () => {
    const now = new Date('2023-09-18T12:20:00.000Z');
    {
      const flashcard = flashcardBuilder()
        .ofId('flashcard1-id')
        .lastReviewed(new Date('2023-09-05T12:21:00.000Z'))
        .inPartition(5)
        .buildAsReviewableFlashcard();

      const flashcardsToReview = getTestNextCardToReview({
        now,
        partitions: [flashcard],
      });

      expect(flashcardsToReview).toBeUndefined();
    }
    {
      const flashcard = flashcardBuilder()
        .ofId('flashcard1-id')
        .lastReviewed(new Date('2023-08-04T12:20:00.000Z'))
        .inPartition(5)
        .buildAsReviewableFlashcard();

      const flashcardsToReview = getTestNextCardToReview({
        now,
        partitions: [flashcard],
      });

      expect(flashcardsToReview).toEqual(flashcard);
    }
  });
});
