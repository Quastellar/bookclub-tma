import { Injectable, NotFoundException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IterStatus } from '@prisma/client';
import { AnnService } from '../ann/ann.service';

@Injectable()
export class IterationsService implements OnModuleInit, OnModuleDestroy {
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(
    private prisma: PrismaService,
    private annService: AnnService,
  ) {}

  onModuleInit() {
    // Проверяем дедлайны каждые 5 минут
    this.checkInterval = setInterval(() => {
      this.checkDeadlines();
    }, 5 * 60 * 1000);
    
    // Сразу проверяем при старте
    this.checkDeadlines();
  }

  onModuleDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

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

  async setDeadline(iterationId: string, meetingDate: Date) {
    return this.prisma.iteration.update({
      where: { id: iterationId },
      data: { meetingDate },
    });
  }

  async announceWinner(iterationId: string) {
    const iter = await this.prisma.iteration.findUnique({
      where: { id: iterationId },
      include: {
        Candidates: {
          include: {
            Book: true,
            AddedBy: { select: { username: true, name: true } },
            Votes: true,
          },
        },
      },
    });

    if (!iter || !iter.Candidates.length) return;

    // Находим победителя
    type CandidateWithRelations = typeof iter.Candidates[0];
    let winner: CandidateWithRelations | null = null;
    let maxVotes = -1;
    for (const c of iter.Candidates) {
      const votes = (c.Votes || []).length;
      if (votes > maxVotes) {
        maxVotes = votes;
        winner = c;
      }
    }

    if (!winner || maxVotes === 0) {
      console.log(`[ANNOUNCE] Итерация ${iter.name}: нет голосов`);
      return;
    }

    // Формируем сообщение
    const addedBy = winner.AddedBy?.username || winner.AddedBy?.name || 'неизвестный';
    const bookTitle = winner.Book?.titleNorm || 'неизвестная книга';
    const authors = (winner.Book?.authorsNorm || []).join(', ') || 'неизвестный автор';
    
    const message = `📚 Результаты голосования "${iter.name}"\n\n` +
      `🏆 Победитель: "${bookTitle}"\n` +
      `✍️ Автор: ${authors}\n` +
      `👤 Предложил: ${addedBy}\n` +
      `🗳️ Голосов: ${maxVotes}`;

    console.log(`[ANNOUNCE] Итерация ${iter.name}:`, { winner: bookTitle, votes: maxVotes, addedBy });
    
    // Отправка в Telegram канал
    await this.sendToChannel(message, winner.Book?.coverUrl);
    
    return { message, winner };
  }

  private async sendToChannel(message: string, coverUrl?: string | null) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    
    if (!botToken || !channelId) {
      console.warn('[ANNOUNCE] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID in env');
      return;
    }

    try {
      // Отправляем сообщение
      await this.annService.sendMessage({
        token: botToken,
        chatId: channelId,
        text: message,
        parseMode: 'Markdown',
        disableWebPagePreview: true,
      });

      // Если есть обложка, отправляем фото отдельно
      if (coverUrl) {
        await this.sendPhoto(botToken, channelId, coverUrl);
      }
      
      console.log('[ANNOUNCE] Message sent to channel');
    } catch (e) {
      console.error('[ANNOUNCE] Failed to send to channel:', e instanceof Error ? e.message : String(e));
    }
  }

  private async sendPhoto(token: string, chatId: string, photoUrl: string) {
    try {
      const url = `https://api.telegram.org/bot${token}/sendPhoto`;
      const body = {
        chat_id: chatId,
        photo: photoUrl,
        caption: '📖 Обложка победившей книги',
      };
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) {
        const error = await res.text();
        console.warn('[ANNOUNCE] Failed to send photo:', error);
      }
    } catch (e) {
      console.warn('[ANNOUNCE] Error sending photo:', e instanceof Error ? e.message : String(e));
    }
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

  private async checkDeadlines() {
    try {
      const now = new Date();
      
      // Находим открытые итерации с истёкшим дедлайном
      const expiredIterations = await this.prisma.iteration.findMany({
        where: {
          status: 'OPEN' as IterStatus,
          meetingDate: {
            lte: now,
          },
        },
      });

      for (const iter of expiredIterations) {
        console.log(`[SCHEDULER] Auto-closing expired iteration: ${iter.name}`);
        
        // Закрываем итерацию
        await this.prisma.iteration.update({
          where: { id: iter.id },
          data: { status: 'CLOSED', closedAt: now },
        });

        // Объявляем результаты
        await this.announceWinner(iter.id);
      }

      if (expiredIterations.length > 0) {
        console.log(`[SCHEDULER] Auto-closed ${expiredIterations.length} iteration(s)`);
      }
    } catch (e) {
      console.error('[SCHEDULER] Error checking deadlines:', e instanceof Error ? e.message : String(e));
    }
  }
}
