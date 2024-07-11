import { Module } from '@nestjs/common';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { BookmarkServiceTest } from './bookmark-test.service';
import { BookmarkTestController } from './bookmark-test.controller';

@Module({
  controllers: [BookmarkController, BookmarkTestController],
  providers: [BookmarkService, BookmarkServiceTest],
})
export class BookmarkModule {}
