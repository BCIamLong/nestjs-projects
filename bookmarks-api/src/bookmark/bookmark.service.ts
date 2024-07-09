import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmark, UpdateBookmark } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks() {
    const bookmarks = await this.prisma.bookmark.findMany();

    return {
      status: 'success',
      data: {
        bookmarks,
      },
    };
  }

  async getBookmark(id: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id,
      },
    });

    if (!bookmark)
      throw new NotFoundException('No bookmarks found with this id');

    return {
      status: 'success',
      data: {
        bookmark,
      },
    };
  }

  async createBookmark(dto: CreateBookmark) {
    const newBookmark = await this.prisma.bookmark.create({
      data: dto,
    });

    return {
      status: 'success',
      data: {
        bookmark: newBookmark,
      },
    };
  }

  async updateBookmark(id: number, dto: UpdateBookmark) {
    try {
      const updatedBookmark = await this.prisma.bookmark.update({
        where: {
          id,
        },
        data: dto,
      });

      return {
        status: 'success',
        data: {
          bookmark: updatedBookmark,
        },
      };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        // ! notice it's throw error, not return because when we return it's response right so that the pattern of nestjs we should follow
        if (err.code === 'P2025')
          throw new NotFoundException('No bookmarks found with this id');
        // * we should use the built-in rather than do like the way bellow, if we have the case we don't have the built-in exception then just do it like the way bellow but also should follow the format of other exceptions
        //  return {
        //       status: 'fail',
        //       message: 'No bookmarks found with this id',
        //     };
      }
    }
  }

  async deleteBookmark(id: number) {
    try {
      await this.prisma.bookmark.delete({
        where: {
          id,
        },
      });

      return {
        status: 'success',
        data: null,
      };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025')
          throw new NotFoundException('No bookmarks found with this id');
      }
    }
  }
}
