import { Bookmark } from '@prisma/client';
import { BaseController } from 'src/common/helpers';
import { CreateBookmark, UpdateBookmark } from './dto';
import { BookmarkServiceTest } from './bookmark-test.service';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PublicRoute } from 'src/common/decorators';
import { Pagination } from 'src/common/dto';
// import { Reflector } from '@nestjs/core';

@Controller('bookmarks-test')
export class BookmarkTestController extends BaseController<
  Bookmark,
  CreateBookmark,
  UpdateBookmark
> {
  // ! we don't need to use reflector here because when we use @Controller then this class will be controller class and itself has the reflector dependency inject so therefore we don't need to implement it again
  constructor(bookmarkTestService: BookmarkServiceTest) {
    super(bookmarkTestService);
    // super(bookmarkTestService, new Reflector());
  }

  @PublicRoute()
  @Get()
  findAll(@Query() query: Pagination) {
    // console.log(query);
    return super.findAll(query);
  }

  @PublicRoute()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return super.findOne(id);
  }
}
