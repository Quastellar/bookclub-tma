import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
// Если хотите использовать node-fetch:
// import fetch from 'node-fetch';

type IndustryId = { type: string; identifier: string };
type GBook = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    industryIdentifiers?: IndustryId[];
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
  };
};

function normalizeIsbn(ids?: IndustryId[]) {
  if (!ids) return { isbn13: undefined as string | undefined, isbn10: undefined as string | undefined };
  let isbn13 = ids.find(x => x.type === 'ISBN_13')?.identifier;
  let isbn10 = ids.find(x => x.type === 'ISBN_10')?.identifier;
  if (isbn13) isbn13 = isbn13.replace(/[^0-9X]/gi, '');
  if (isbn10) isbn10 = isbn10.replace(/[^0-9X]/gi, '');
  return { isbn13, isbn10 };
}

@Injectable()
export class BooksService {
  private redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  async lookup(q: string) {
    const key = `gbooks:${Buffer.from(q).toString('base64')}`;
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached);

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&printType=books&projection=lite`;
    const res = await fetch(url as any);
    if (!res.ok) {
      throw new Error(`Google Books error: ${res.status}`);
    }
    const json: { items?: GBook[] } = await res.json();

    const items = (json.items || []).map(b => {
      const vi = b.volumeInfo || {};
      const { isbn13, isbn10 } = normalizeIsbn(vi.industryIdentifiers);
      const year = vi.publishedDate ? Number(vi.publishedDate.slice(0, 4)) : undefined;
      const cover =
        vi.imageLinks?.extraLarge ||
        vi.imageLinks?.large ||
        vi.imageLinks?.medium ||
        vi.imageLinks?.thumbnail ||
        vi.imageLinks?.smallThumbnail ||
        vi.imageLinks?.small;

      return {
        sourceId: b.id,
        title: (vi.title || '').trim(),
        authors: vi.authors || [],
        year: Number.isFinite(year) ? year : undefined,
        isbn13,
        isbn10,
        coverUrl: cover,
        source: 'google_books' as const,
      };
    });

    // кеш на 24 часа
    await this.redis.setex(key, 60 * 60 * 24, JSON.stringify(items));
    return items;
  }
}
