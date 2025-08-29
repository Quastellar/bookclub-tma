import { Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly svc: CandidatesService) {}

  @Post()
  add(@Req() req: any, @Body() dto: {
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
    reason?: string;
  }) {
    console.log('[CANDIDATE][POST] Full DTO received:', JSON.stringify(dto, null, 2));
    console.log('[CANDIDATE][POST] user', req.user?.id, 'book', {
      titleNorm: dto?.book?.titleNorm,
      authorsNorm: dto?.book?.authorsNorm,
      year: dto?.book?.year,
      isbn13: dto?.book?.isbn13,
      source: dto?.book?.source,
    });
    return this.svc.addToCurrentIteration({
      book: dto.book,
      addedByUserId: req.user.id,
      reason: dto.reason,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log('[CANDIDATE][DELETE]', id);
    return this.svc.remove(id);
  }
}
