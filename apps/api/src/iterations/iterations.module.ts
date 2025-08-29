import { Module } from '@nestjs/common';
import { IterationsService } from './iterations.service';
import { IterationsController } from './iterations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AnnModule } from '../ann/ann.module';

@Module({
  imports: [PrismaModule, AnnModule],
  providers: [IterationsService],
  controllers: [IterationsController],
  exports: [IterationsService],
})
export class IterationsModule {}
