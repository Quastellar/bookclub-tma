import { Module } from '@nestjs/common';
import { AnnService } from './ann.service';
import { AnnController } from './ann.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [AnnService],
  controllers: [AnnController],
  exports: [AnnService],
})
export class AnnModule {}
