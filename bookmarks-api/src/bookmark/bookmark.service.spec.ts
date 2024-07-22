import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkService } from './bookmark.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BookmarkService', () => {
  let service: BookmarkService;
  let prisma: PrismaService;
  const bookmarkId = 12345;
  const userId = 1;

  const invalidBookmarkInput = {
    title: '',
    description: 'Description',
    link: '',
  };

  const bookmarkInput = {
    title: 'Test Bookmark',
    description: 'Description',
    link: 'link',
  };

  const bookmark = {
    id: 123,
    title: 'Test Bookmark',
    description: 'Description',
    link: 'link',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookmarkService, PrismaService, ConfigService],
    }).compile();

    service = module.get<BookmarkService>(BookmarkService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBookmarks', () => {
    describe('give the bookmarks data is empty in DB', () => {
      it('should return an empty array', async () => {
        jest.spyOn(prisma.bookmark, 'findMany').mockResolvedValue([]);

        const result = await service.getBookmarks();

        expect(prisma.bookmark.findMany).toHaveBeenCalled();
        expect(result).toStrictEqual({ bookmarks: [] });
      });
    });

    describe('give the bookmarks data is not empty in DB', () => {
      it('should return a list of bookmarks', async () => {
        jest.spyOn(prisma.bookmark, 'findMany').mockResolvedValue([bookmark]);

        const result = await service.getBookmarks();

        expect(prisma.bookmark.findMany).toHaveBeenCalled();
        expect(result).toStrictEqual({ bookmarks: [bookmark] });
      });
    });
  });

  describe('getBookmark', () => {
    describe('give the invalid id', () => {
      it('should return a 404', async () => {
        jest
          .spyOn(prisma.bookmark, 'findUnique')
          .mockRejectedValue(
            new NotFoundException('No bookmark found with this id'),
          );

        await expect(service.getBookmark(bookmarkId)).rejects.toThrow(
          'No bookmark found with this id',
        );
        expect(prisma.bookmark.findUnique).toHaveBeenCalled();
      });
    });

    describe('give the valid id', () => {
      it('should return a bookmark', async () => {
        jest.spyOn(prisma.bookmark, 'findUnique').mockResolvedValue(bookmark);

        await expect(service.getBookmark(bookmarkId)).resolves.toStrictEqual({
          bookmark,
        });
        expect(prisma.bookmark.findUnique).toHaveBeenCalled();
      });
    });
  });

  describe('createBookmark', () => {
    describe('give the invalid input', () => {
      it('should return a 400', async () => {
        jest
          .spyOn(prisma.bookmark, 'create')
          .mockRejectedValue(new BadRequestException('Invalid input'));

        try {
          await service.createBookmark(userId, invalidBookmarkInput);
        } catch (err) {
          expect(err.status).toBe(400);
          expect(prisma.bookmark.create).toHaveBeenCalled();
        }
      });
    });

    describe('give the valid input', () => {
      it('should return a new bookmark', async () => {
        jest.spyOn(prisma.bookmark, 'create').mockResolvedValue(bookmark);

        await expect(
          service.createBookmark(userId, bookmarkInput),
        ).resolves.toStrictEqual({ bookmark });

        expect(prisma.bookmark.create).toHaveBeenCalled();
      });
    });
  });

  describe('updateBookmark', () => {
    describe('give the invalid id', () => {
      it('should return a 404', async () => {
        jest
          .spyOn(prisma.bookmark, 'update')
          .mockRejectedValue(new NotFoundException());
        try {
          await service.updateBookmark(bookmarkId, bookmarkInput);
        } catch (err) {
          expect(err.status).toBe(404);
          expect(prisma.bookmark.update).toHaveBeenCalled();
        }
      });
    });

    describe('give the valid id but the invalid input', () => {
      it('should return a 400', async () => {
        jest
          .spyOn(prisma.bookmark, 'update')
          .mockRejectedValue(new BadRequestException());
        try {
          await service.updateBookmark(bookmarkId, invalidBookmarkInput);
        } catch (err) {
          expect(err.status).toBe(400);
          expect(prisma.bookmark.update).toHaveBeenCalled();
        }
      });
    });

    describe('give the valid id and the valid input', () => {
      it('should return an updated bookmark', async () => {
        jest.spyOn(prisma.bookmark, 'update').mockResolvedValue(bookmark);

        await expect(
          service.updateBookmark(bookmarkId, bookmarkInput),
        ).resolves.toStrictEqual({ bookmark });

        expect(prisma.bookmark.update).toHaveBeenCalled();
      });
    });
  });

  describe('deleteBookmark', () => {
    describe('give the invalid id', () => {
      it('should return a 404', async () => {
        jest
          .spyOn(prisma.bookmark, 'delete')
          .mockRejectedValue(new NotFoundException());

        try {
          await service.deleteBookmark(bookmarkId);
        } catch (err) {
          expect(err.status).toBe(404);
          expect(prisma.bookmark.delete).toHaveBeenCalledTimes(1);
        }
      });
    });

    describe('give the valid id', () => {
      it('should return null', async () => {
        jest.spyOn(prisma.bookmark, 'delete').mockResolvedValue(null);

        await expect(service.deleteBookmark(bookmarkId)).resolves.toBe(null);

        expect(prisma.bookmark.delete).toHaveBeenCalledTimes(1);
      });
    });
  });
});
