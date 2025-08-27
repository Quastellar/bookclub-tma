import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async addToCurrentIteration(params: {
    book: {
      titleNorm: string;
      authorsNorm: string[];
      year?: number;
      isbn10?: string | null;
      isbn13?: string | null;
      coverUrl?: string | null;
      source?: string | null;
      meta?: any;
    };
    addedByUserId: string;
    reason?: string;
  }) {
    // найти/создать книгу по isbn13 либо title+authors
    const book = await this.upsertBook(params.book);
    console.log('[CANDIDATE][UPSERT_BOOK] id', book.id, 'isbn13', book.isbn13, 'title', book.titleNorm);

    // найти текущую итерацию
    const iter = await this.prisma.iteration.findFirst({ where: { status: 'OPEN' } });
    if (!iter) throw new BadRequestException('Нет активной итерации');
    console.log('[CANDIDATE][CURRENT_ITER]', iter.id, iter.name);

    // создать кандидата (уникальность bookId+iterationId)
    try {
      return await this.prisma.candidate.create({
        data: {
          bookId: book.id,
          addedByUserId: params.addedByUserId,
          iterationId: iter.id,
          reason: params.reason ?? null,
        },
        include: { Book: true },
      });
    } catch (e: any) {
      if (String(e?.code) === 'P2002') {
        throw new BadRequestException('Книга уже есть в текущей итерации');
      }
      console.error('[CANDIDATE][CREATE_ERROR]', e);
      throw e;
    }
  }

  private async upsertBook(b: {
    titleNorm: string;
    authorsNorm: string[];
    year?: number;
    isbn10?: string | null;
    isbn13?: string | null;
    coverUrl?: string | null;
    source?: string | null;
    meta?: any;
  }) {
    if (b.isbn13) {
      const ex = await this.prisma.book.findUnique({ where: { isbn13: b.isbn13 } });
      if (ex) return ex;
    }
    // нормализовать title/author нижним регистром заранее
    const created = await this.prisma.book.create({ data: b as any });
    console.log('[BOOK][CREATE]', created.id, created.titleNorm, created.isbn13);
    return created;
  }

  async remove(candidateId: string) {
    return this.prisma.candidate.delete({ where: { id: candidateId } });
  }
}
