import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { IterationsService } from './iterations.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('iterations')
export class IterationsController {
  constructor(private readonly svc: IterationsService) {}

  private checkAdmin(user: any) {
    if (!user?.roles?.includes('admin')) {
      throw new ForbiddenException('Требуются права администратора');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: { name: string; isPublicVotes?: boolean; meetingDate?: string }, @Req() req: any) {
    this.checkAdmin(req.user);
    return this.svc.create(dto.name, dto.isPublicVotes ?? false, dto.meetingDate ? new Date(dto.meetingDate) : undefined);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/open')
  async open(@Param('id') id: string, @Req() req: any) {
    this.checkAdmin(req.user);
    return this.svc.open(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/close')
  async close(@Param('id') id: string, @Req() req: any) {
    this.checkAdmin(req.user);
    console.log(`[CONTROLLER] Manual close initiated for iteration: ${id} by user: ${req.user?.username || req.user?.id}`);
    
    const result = await this.svc.close(id);
    console.log(`[CONTROLLER] Iteration ${id} closed successfully, starting announcement...`);
    
    // Запускаем аннонс в канал
    try {
      await this.svc.announceWinner(id);
      console.log(`[CONTROLLER] ✅ Announcement completed for iteration ${id}`);
    } catch (error) {
      console.error(`[CONTROLLER] ❌ Announcement failed for iteration ${id}:`, error);
      // Не прокидываем ошибку, итерация уже закрыта
    }
    
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/deadline')
  async setDeadline(@Param('id') id: string, @Body() dto: { meetingDate: string }, @Req() req: any) {
    this.checkAdmin(req.user);
    return this.svc.setDeadline(id, new Date(dto.meetingDate));
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
  @Get('current/admin')
  async currentForAdmin(@Req() req: any) {
    this.checkAdmin(req.user);
    try {
      return await this.svc.latestIterationForAdmin();
    } catch {
      throw new NotFoundException('Нет итераций');
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
