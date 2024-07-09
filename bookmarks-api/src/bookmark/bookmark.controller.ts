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

@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get('')
  getBookmarks() {
    return this.bookmarkService.getBookmarks();
  }

  @Get(':id')
  // * in this case we just use param and it's one value right and we do not need to convert it to DTO so we just use the ParseIntPipe built-in pipe so it's good in this case right
  // * https://docs.google.com/document/d/1y9f8kwle4hT-2l7XoJyzPEGDZ8K26dueDZO0yZTuRHA/edit
  getBookmark(@Param('id', ParseIntPipe) id: number) {
    return this.bookmarkService.getBookmark(id);
  }

  @Post('')
  createBookmark(@Body() dto: CreateBookmark) {
    return this.bookmarkService.createBookmark(dto);
  }

  @Patch(':id')
  updateBookmark(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookmark,
  ) {
    return this.bookmarkService.updateBookmark(id, dto);
  }

  @Delete(':id')
  deleteBookmark(@Param('id', ParseIntPipe) id: number) {
    return this.bookmarkService.deleteBookmark(id);
  }
}
