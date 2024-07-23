import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { CreateBookmark, UpdateBookmark } from './dto';
import { PublicRoute } from 'src/common/decorators';
import { BookmarkServiceTest } from './bookmark-test.service';
import { ParseIntPipeCustom } from 'src/common/pipes';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggerService } from 'src/shared/logger/logger.service';
import { GetUser } from 'src/auth/decorators';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('bookmarks')
@Controller('bookmarks')
export class BookmarkController {
  constructor(
    private bookmarkService: BookmarkService,
    private bookmarkTestService: BookmarkServiceTest,
    private logger: LoggerService,
  ) {}

  @ApiOperation({ summary: 'get a list of bookmarks' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 500, description: 'Something went wrong' })
  @PublicRoute()
  @Get('')
  getBookmarks() {
    // return this.bookmarkTestService.findAll();
    this.logger.log(
      'CREATE CUSTOM LOGGER AND USE IT AS DEPENDENCIES INJECTION',
    );
    return this.bookmarkService.getBookmarks();
  }

  @UseInterceptors(CacheInterceptor)
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
    console.log('Caching...............');
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
  createBookmark(@GetUser('id') userId: number, @Body() dto: CreateBookmark) {
    return this.bookmarkService.createBookmark(userId, dto);
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmark(@Param('id', ParseIntPipe) id: number) {
    return this.bookmarkService.deleteBookmark(id);
  }
}
