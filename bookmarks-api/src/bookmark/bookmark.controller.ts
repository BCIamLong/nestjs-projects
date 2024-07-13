import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { CreateBookmark, UpdateBookmark } from './dto';
import { PublicRoute } from 'src/common/decorators';
import { BookmarkServiceTest } from './bookmark-test.service';
import { ParseIntPipeCustom } from 'src/common/pipes';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('bookmarks')
@Controller('bookmarks')
export class BookmarkController {
  constructor(
    private bookmarkService: BookmarkService,
    private bookmarkTestService: BookmarkServiceTest,
  ) {}

  @ApiOperation({ summary: 'get a list of bookmarks' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 500, description: 'Something went wrong' })
  @PublicRoute()
  @Get('')
  getBookmarks() {
    // return this.bookmarkTestService.findAll();
    return this.bookmarkService.getBookmarks();
  }

  @ApiOperation({ summary: 'get a specific bookmark' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Something went wrong' })
  @PublicRoute()
  @Get(':id')
  // * in this case we just use param and it's one value right and we do not need to convert it to DTO so we just use the ParseIntPipe built-in pipe so it's good in this case right
  // * https://docs.google.com/document/d/1y9f8kwle4hT-2l7XoJyzPEGDZ8K26dueDZO0yZTuRHA/edit
  getBookmark(@Param('id', ParseIntPipeCustom) id: number) {
    // return this.bookmarkTestService.findOne(id);
    return this.bookmarkService.getBookmark(id);
  }

  @ApiOperation({ summary: 'create a bookmark' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Something went wrong' })
  @Post('')
  createBookmark(@Body() dto: CreateBookmark) {
    return this.bookmarkService.createBookmark(dto);
  }

  @ApiOperation({ summary: 'update a bookmark' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Something went wrong' })
  @Patch(':id')
  updateBookmark(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookmark,
  ) {
    return this.bookmarkService.updateBookmark(id, dto);
  }

  @ApiOperation({ summary: 'delete a bookmark' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Something went wrong' })
  @Delete(':id')
  deleteBookmark(@Param('id', ParseIntPipe) id: number) {
    return this.bookmarkService.deleteBookmark(id);
  }
}
