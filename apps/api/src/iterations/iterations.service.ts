import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IterStatus } from '@prisma/client';

@Injectable()
export class IterationsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, isPublicVotes = false, meetingDate?: Date) {
    return this.prisma.iteration.create({
      data: { name, status: 'PLANNED', isPublicVotes, meetingDate },
    });
  }

  async open(iterationId: string) {
    return this.prisma.iteration.update({
      where: { id: iterationId },
      data: { status: 'OPEN', openedAt: new Date(), closedAt: null },
    });
  }

  async close(iterationId: string) {
    return this.prisma.iteration.update({
      where: { id: iterationId },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }

  async currentWithCandidates() {
    const iter = await this.prisma.iteration.findFirst({
      where: { status: 'OPEN' as IterStatus },
      orderBy: { openedAt: 'desc' },
      include: {
        Candidates: {
          include: {
            Book: true,
            AddedBy: { select: { id: true, tgUserId: true, username: true, name: true } },
          },
        },
      },
    });
    if (!iter) {
      throw new NotFoundException('No open iteration');
    }
    return iter;
  }

  async currentWithVotes(userId: string) {
    const iter = await this.prisma.iteration.findFirst({
      where: { status: 'OPEN' as IterStatus },
      orderBy: { openedAt: 'desc' },
      include: {
        Candidates: {
          include: {
            Book: true,
            AddedBy: { select: { id: true, tgUserId: true, username: true, name: true } },
            Votes: { select: { id: true, userId: true } },
          },
        },
        Votes: { select: { id: true, userId: true, candidateId: true } },
      },
    });
    if (!iter) throw new NotFoundException('No open iteration');

    const counts: Record<string, number> = {};
    for (const c of iter.Candidates) {
      counts[c.id] = (c.Votes || []).length;
    }

    const my = (iter.Votes || []).find(v => v.userId === userId) || null;

    return {
      ...iter,
      voteCounts: counts,
      myVoteCandidateId: my?.candidateId || null,
    };
  }

  async historyWithResults(limit = 10) {
    const iters = await this.prisma.iteration.findMany({
      where: { status: 'CLOSED' as IterStatus },
      orderBy: { closedAt: 'desc' },
      take: limit,
      include: {
        Candidates: {
          include: {
            Book: true,
            Votes: true,
          },
        },
      },
    });

    return iters.map(it => {
      let winnerId: string | null = null;
      let winnerVotes = -1;
      const voteCounts: Record<string, number> = {};
      for (const c of it.Candidates) {
        const count = (c.Votes || []).length;
        voteCounts[c.id] = count;
        if (count > winnerVotes) {
          winnerVotes = count;
          winnerId = c.id;
        }
      }
      return { ...it, voteCounts, winnerCandidateId: winnerId };
    });
  }
}
