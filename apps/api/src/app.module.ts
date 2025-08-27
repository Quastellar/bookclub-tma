import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// новые модули
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { IterationsModule } from './iterations/iterations.module';
import { CandidatesModule } from './candidates/candidates.module';
import { VotesModule } from './votes/votes.module';
import { UsersModule } from './users/users.module';
import { AnnModule } from './ann/ann.module';

@Module({
  imports: [
    AuthModule,
    BooksModule,
    IterationsModule,
    CandidatesModule,
    VotesModule,
    UsersModule,
    AnnModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
