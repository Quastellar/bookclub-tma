import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import jwt from 'jsonwebtoken';
import { validateInitData, parseUserFromInitData } from './tma';

@Controller('auth/telegram')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Post('init')
  async init(@Body() dto: { initData: string }) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const jwtSecret = process.env.JWT_SECRET;
    if (!botToken || !jwtSecret) {
      console.warn('[AUTH] Missing TELEGRAM_BOT_TOKEN or JWT_SECRET');
      throw new HttpException('Server auth is not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const ok = validateInitData(dto?.initData || '', botToken, 3600);
    if (!ok) {
      console.warn('[AUTH] Invalid initData');
      throw new HttpException('Invalid initData', HttpStatus.UNAUTHORIZED);
    }

    const tgUser = parseUserFromInitData(dto.initData);
    if (!tgUser?.id) {
      console.warn('[AUTH] No user in initData');
      throw new HttpException('No user in initData', HttpStatus.BAD_REQUEST);
    }

    const username = tgUser.username || undefined;
    const name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || undefined;

    const user = await this.prisma.user.upsert({
      where: { tgUserId: String(tgUser.id) },
      update: { username, name },
      create: { tgUserId: String(tgUser.id), username, name, roles: [] },
      select: { id: true, tgUserId: true, username: true, name: true, roles: true, createdAt: true },
    });

    const token = jwt.sign({ uid: user.id, tg: user.tgUserId, r: user.roles }, jwtSecret, { expiresIn: '7d' });
    console.log('[AUTH] Issued token for user', user.id);

    return { token, user };
  }
}
