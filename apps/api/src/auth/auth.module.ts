import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // вот это и даёт PrismaService внутри AuthModule
  controllers: [AuthController],
})
export class AuthModule {}
