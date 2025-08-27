import { Module } from '@nestjs/common';
import { IterationsService } from './iterations.service';
import { IterationsController } from './iterations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [IterationsService],
  controllers: [IterationsController],
  exports: [IterationsService],
})
export class IterationsModule {}
