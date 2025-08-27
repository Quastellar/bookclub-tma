import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  async vote(userId: string, candidateId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { Iteration: true },
    });
    if (!candidate) throw new BadRequestException('Кандидат не найден');
    if (candidate.Iteration.status !== 'OPEN') throw new BadRequestException('Итерация не активна');

    // запрет голосовать за свою книгу
    const isSelf = await this.prisma.candidate.findFirst({
      where: { id: candidateId, addedByUserId: userId },
    });
    if (isSelf) throw new BadRequestException('Нельзя голосовать за собственную книгу');

    // upsert по уникальности (userId, iterationId)
    const existing = await this.prisma.vote.findUnique({
      where: { userId_iterationId: { userId, iterationId: candidate.iterationId } },
    }).catch(() => null as any);

    if (existing) {
      return this.prisma.vote.update({
        where: { id: existing.id },
        data: { candidateId },
      });
    }

    return this.prisma.vote.create({
      data: {
        userId,
        iterationId: candidate.iterationId,
        candidateId,
      },
    });
  }
}
