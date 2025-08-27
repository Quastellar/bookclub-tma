import { Controller, Get, Query } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly books: BooksService) {}

  @Get('lookup')
  async lookup(@Query('q') q?: string) {
    console.log('Books lookup called with q:', q);

    const query = (q || '').trim();
    console.log('Processed query:', query);

    if (query.length < 2) {
      console.log('Query too short, returning empty array');
      return [];
    }

    try {
      console.log('Calling books.lookup with query:', query);
      const items = await this.books.lookup(query);
      console.log('Raw items from service:', items.length, 'items');

      // Простая дедупликация по isbn13 либо по (title+authors)
      const seen = new Set<string>();
      const dedup = items.filter((it) => {
        const key =
          it.isbn13 ||
          `${(it.title || '').toLowerCase()}::${(it.authors || [])
            .join(',')
            .toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      console.log('After deduplication:', dedup.length, 'items');
      console.log('Final result:', dedup);
      return dedup;
    } catch (error) {
      console.error('Books lookup error:', error);
      throw error;
    }
  }

  @Get('test')
  test() {
    console.log('Books test endpoint called');
    return {
      message: 'Books controller is working!',
      timestamp: new Date(),
      status: 'OK',
    };
  }
}
