import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/flashcard/infra/prisma.service';
import { FlashcardsListDto } from './flashcards-list.dto';

@Injectable()
export class ListFlashcards {
  constructor(private readonly prismaClient: PrismaService) {}

  async execute({ userId }: { userId: string }): Promise<FlashcardsListDto> {
    const result = await this.prismaClient.box.findFirstOrThrow({
      where: {
        userId: userId,
      },
      select: {
        Partition: {
          select: {
            flashcards: {
              select: {
                id: true,
                front: true,
                back: true,
              },
            },
          },
        },
      },
    });

    return {
      flashcards: result.Partition.flatMap((partition) => partition.flashcards),
    };
  }
}
