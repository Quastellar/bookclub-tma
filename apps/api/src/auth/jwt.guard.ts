import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || '';
    const token = typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7) : '';

    if (!token) {
      console.warn('[JWT] Missing token for', req.method, req.url);
      throw new UnauthorizedException('No token');
    }

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      console.warn('[JWT] Invalid token for', req.method, req.url);
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.uid } });
    if (!user) {
      console.warn('[JWT] User not found', payload?.uid);
      throw new UnauthorizedException('User not found');
    }

    req.user = user;
    return true;
  }
}
