import { Bookmark } from '@prisma/client';
import { ControllerFactory } from 'src/common/helpers';
import { BookmarkDTO, CreateBookmark, UpdateBookmark } from './dto';
import { BookmarkServiceTest } from './bookmark-test.service';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiResult, PublicRoute } from 'src/common/decorators';
import { Pagination } from 'src/common/dto';
// import { Reflector } from '@nestjs/core';

// * with this use base controller function factory we will able to more flexible in this case we can use it easy to integrate the api doc with swagger
// * because if we use just BaseController we have no way to take the DTO and use it as value and type maybe in TypeORM we can but in this case we use Prisma so there is no way and prisma maybe will add this feature in the feature
// * bit we need the function to get the DTO as the value to use in our api swagger decorator to render the schema therefore we need to use this way in this when we implement api doc with swagger
// * otherwise if we don't implement api doc swagger then just use the BaseController way, maybe in this case it's api doc swagger problem but maybe in the future we will have another problem
// * so therefore better we should use this controller factory function way be cause it's more scalable right
@Controller('bookmarks-test-base-func')
export class BookmarkTestBaseFuncController extends ControllerFactory(
  BookmarkDTO,
  CreateBookmark,
  UpdateBookmark,
)<Bookmark, CreateBookmark, UpdateBookmark> {
  // ! we don't need to use reflector here because when we use @Controller then this class will be controller class and itself has the reflector dependency inject so therefore we don't need to implement it again
  constructor(bookmarkTestService: BookmarkServiceTest) {
    super(bookmarkTestService);
    // super(bookmarkTestService, new Reflector());
  }

  @ApiResult(BookmarkDTO, 'bookmark', 'getAll')
  @PublicRoute()
  @Get()
  findAll(@Query() query: Pagination) {
    return super.findAll(query);
  }

  @ApiResult(BookmarkDTO, 'bookmark', 'getOne')
  @PublicRoute()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return super.findOne(id);
  }
}
