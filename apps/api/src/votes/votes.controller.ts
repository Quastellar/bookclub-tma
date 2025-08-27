import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('votes')
export class VotesController {
  constructor(private readonly svc: VotesService) {}

  @Post()
  async vote(@Req() req: any, @Body() dto: { candidateId: string }) {
    console.log('[VOTE] user', req.user?.id, 'candidate', dto?.candidateId);
    return this.svc.vote(req.user.id, dto.candidateId);
  }
}
