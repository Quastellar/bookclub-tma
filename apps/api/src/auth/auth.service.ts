import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async upsertUserFromTelegram(tg: { id: number; username?: string; first_name?: string; last_name?: string }) {
    const name = [tg.first_name, tg.last_name].filter(Boolean).join(' ').trim() || null;
    const user = await this.prisma.user.upsert({
      where: { tgUserId: String(tg.id) },
      create: { tgUserId: String(tg.id), username: tg.username ?? null, name, roles: [] },
      update: { username: tg.username ?? null, name },
    });
    return user;
  }

  issueJwt(payload: { uid: string }, secret: string, expiresIn = '24h') {
    return jwt.sign(payload, secret, { expiresIn });
  }
}
