import { Module } from '@nestjs/common';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { BookmarkServiceTest } from './bookmark-test.service';
import { BookmarkTestController } from './bookmark-test.controller';
import { BookmarkTestBaseFuncController } from './bookmark-test-base-func.controller';

@Module({
  controllers: [
    BookmarkController,
    BookmarkTestController,
    BookmarkTestBaseFuncController,
  ],
  providers: [BookmarkService, BookmarkServiceTest],
})
export class BookmarkModule {}
