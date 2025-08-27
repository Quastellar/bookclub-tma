import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IterationsService } from './iterations.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('iterations')
export class IterationsController {
  constructor(private readonly svc: IterationsService) {}

  @Post()
  async create(@Body() dto: { name: string; isPublicVotes?: boolean; meetingDate?: string }) {
    return this.svc.create(dto.name, dto.isPublicVotes ?? false, dto.meetingDate ? new Date(dto.meetingDate) : undefined);
  }

  @Patch(':id/open')
  open(@Param('id') id: string) {
    return this.svc.open(id);
  }

  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.svc.close(id);
  }

  @Get('current')
  async current() {
    try {
      return await this.svc.currentWithCandidates();
    } catch {
      throw new NotFoundException('Нет активной итерации');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('current/full')
  async currentFull(@Req() req: any) {
    try {
      return await this.svc.currentWithVotes(req.user.id);
    } catch {
      throw new NotFoundException('Нет активной итерации');
    }
  }

  @Get('history')
  async history() {
    return this.svc.historyWithResults(10);
  }
}
