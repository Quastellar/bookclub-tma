import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async create(@Body() dto: { tgUserId: string; name?: string; username?: string; roles?: string[] }) {
    return this.prisma.user.create({
      data: {
        tgUserId: String(dto.tgUserId),
        name: dto.name ?? null,
        username: dto.username ?? null,
        roles: dto.roles ?? [],
      },
      select: { id: true, tgUserId: true, name: true, username: true, roles: true },
    });
  }
}
