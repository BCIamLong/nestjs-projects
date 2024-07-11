import { Bookmark } from '@prisma/client';
import { BaseService } from 'src/common/helpers';
import { CreateBookmark, UpdateBookmark } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BookmarkServiceTest extends BaseService<
  Bookmark,
  CreateBookmark,
  UpdateBookmark
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'Bookmark');
  }
}
