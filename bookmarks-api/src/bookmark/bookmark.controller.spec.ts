import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { BookmarkTestController } from './bookmark-test.controller';
import { BookmarkServiceTest } from './bookmark-test.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
// import { RolesGuard } from 'src/common/guards';

describe('BookmarkController', () => {
  // ---------------------------------
  let bookmarkController: BookmarkController;
  let bookmarkService: BookmarkService;
  const bookmarkId = 12345;

  const invalidBookmarkInput = {
    title: '',
    description: 'Description',
    link: '',
    userId: 0,
  };

  const bookmarkInput = {
    title: 'Test Bookmark',
    description: 'Description',
    link: 'link',
    userId: 1,
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

  // const resMock = {} as unknown as Request;
  // const reqMock = {} as unknown as Response;
  // ------------------------------------

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController, BookmarkTestController],
      providers: [
        // {
        //   provide: BookmarkService,
        //   useValue: {
        //     getBookmarks: jest.fn().mockImplementationOnce(() => [bookmark]),
        // * this way is also good but what happen if i test this function for many cases right, so like i want to test this getBookmarks return empty array, list of bookmarks...
        // * therefore we should use the way we declare bookmark service and take the service from the testing module then use jest.spyOn(service) and take the method we want to mock
        // * so that's better because we can mock the value of the function suite with the test cases right
        //   },
        // },
        BookmarkService,
        BookmarkServiceTest,
        PrismaService,
        ConfigService,
      ],
    }).compile();

    bookmarkController = app.get<BookmarkController>(BookmarkController);
    bookmarkService = app.get<BookmarkService>(BookmarkService);
  });

  describe('getBookmarks', () => {
    describe('the bookmarks data is in DB', () => {
      it('should return a list of bookmarks', async () => {
        jest
          .spyOn(bookmarkService, 'getBookmarks')
          .mockResolvedValue({ bookmarks: [bookmark] });

        const bookmarks = await bookmarkController.getBookmarks();
        expect(bookmarks).toStrictEqual({ bookmarks: [bookmark] });
      });
    });
    describe('the bookmarks data is empty in DB', () => {
      it('should return a empty array', async () => {
        jest
          .spyOn(bookmarkService, 'getBookmarks')
          .mockResolvedValue({ bookmarks: [] });

        const result = await bookmarkController.getBookmarks();

        expect(result).toStrictEqual({ bookmarks: [] });
      });
    });
  });

  describe('getBookmark', () => {
    describe('give the invalid id', () => {
      it('should return a 404', async () => {
        jest.spyOn(bookmarkService, 'getBookmark').mockRejectedValue({
          statusCode: 404,
        });

        try {
          await bookmarkController.getBookmark(123456);
        } catch (err) {
          expect(err.statusCode).toBe(404);
        }
      });
    });

    describe('give the valid id', () => {
      it('should return a bookmark', async () => {
        jest
          .spyOn(bookmarkService, 'getBookmark')
          .mockResolvedValue({ bookmark });

        const result = await bookmarkController.getBookmark(1);
        expect(result).toStrictEqual({ bookmark });
      });
    });
  });

  describe('createBookmark', () => {
    describe('give the invalid input', () => {
      it('should return a 400', async () => {
        jest.spyOn(bookmarkService, 'createBookmark').mockRejectedValue({
          statusCode: 400,
        });
        try {
          await bookmarkController.createBookmark(invalidBookmarkInput);
        } catch (err) {
          expect(bookmarkService.createBookmark).toHaveBeenCalledWith(
            invalidBookmarkInput,
          );
          expect(err.statusCode).toBe(400);
        }
      });
    });

    describe('give the valid input', () => {
      it('should return a new bookmark', async () => {
        jest
          .spyOn(bookmarkService, 'createBookmark')
          .mockResolvedValue({ bookmark });

        const result = await bookmarkController.createBookmark(bookmarkInput);

        expect(bookmarkService.createBookmark).toHaveBeenCalledWith(
          bookmarkInput,
        );
        expect(result).toStrictEqual({ bookmark });
      });
    });
  });

  describe('updateBookmark', () => {
    describe('give the invalid id', () => {
      it('should return a 404', async () => {
        jest.spyOn(bookmarkService, 'updateBookmark').mockRejectedValue({
          statusCode: 404,
        });

        try {
          await bookmarkController.updateBookmark(bookmarkId, bookmarkInput);
        } catch (err) {
          expect(bookmarkService.updateBookmark).toHaveBeenCalledWith(
            bookmarkId,
            bookmarkInput,
          );
          expect(err.statusCode).toBe(404);
        }
      });
    });

    describe('give the valid id but the invalid input', () => {
      it('should return a 404', async () => {
        jest.spyOn(bookmarkService, 'updateBookmark').mockRejectedValue({
          statusCode: 400,
        });

        try {
          await bookmarkController.updateBookmark(
            bookmarkId,
            invalidBookmarkInput,
          );
        } catch (err) {
          expect(bookmarkService.updateBookmark).toHaveBeenCalledWith(
            bookmarkId,
            invalidBookmarkInput,
          );
          expect(err.statusCode).toBe(400);
        }
      });
    });

    describe('give the valid id and the valid input', () => {
      it('should return a updated bookmark', async () => {
        jest
          .spyOn(bookmarkService, 'updateBookmark')
          .mockResolvedValue({ bookmark });

        const result = await bookmarkController.updateBookmark(
          bookmarkId,
          bookmarkInput,
        );

        expect(bookmarkService.updateBookmark).toHaveBeenCalledWith(
          bookmarkId,
          bookmarkInput,
        );
        expect(result).toStrictEqual({ bookmark });
      });
    });
  });

  describe('deleteBookmark', () => {
    describe('give the invalid id', () => {
      it('should return a 404', async () => {
        jest.spyOn(bookmarkService, 'deleteBookmark').mockRejectedValue({
          statusCode: 404,
        });

        try {
          await bookmarkController.deleteBookmark(123456);
        } catch (err) {
          // console.log(err);
          expect(err.statusCode).toBe(404);
        }
      });
    });

    describe('give the valid id', () => {
      it('should return null', async () => {
        jest.spyOn(bookmarkService, 'deleteBookmark').mockResolvedValue(null);

        const result = await bookmarkController.deleteBookmark(bookmarkId);

        expect(bookmarkService.deleteBookmark).toHaveBeenCalledWith(bookmarkId);
        expect(result).toBe(null);
      });
    });
  });
});
