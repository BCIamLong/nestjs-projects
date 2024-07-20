import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkController } from 'src/bookmark/bookmark.controller';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BookmarkServiceTest } from 'src/bookmark/bookmark-test.service';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

// * WE JUST TEST LOGIC IN THE SERVICE WITH OUR DB AND EXTERNAL SERVICES OR DEPENDENCIES AND WITHOUT MOCK ANYTHING RIGHT
// * WE DON'T TOUCH TO CONTROLLER BECAUSE FOR THAT WE NEED SEND REQUEST AND WE CAN USE SOMETHING LIKE SUPER TEST BUT IT'S E2E TESTING (BACKEND) RIGHT
// * BUT THIS IS INTEGRATION TESTING SO WE JUST TEST LIKE THIS

describe('Bookmark (integration)', () => {
  let bookmarkService: BookmarkService;
  let prisma: PrismaService;
  let userId: number;
  let bookmarkId: number;

  const bookmarkInput = {
    title: 'Test Bookmark',
    description: 'Description',
    link: 'link',
  };

  const userInput = {
    email: 'test@gmail.com',
    name: 'Test User',
    role: 'user',
    password: 'test123',
  };

  // const bookmark = {
  //   id: 123,
  //   title: 'Test Bookmark',
  //   description: 'Description',
  //   link: 'link',
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  //   userId: 1,
  // };

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController],
      providers: [
        BookmarkService,
        PrismaService,
        ConfigService,
        BookmarkServiceTest,
      ],
    }).compile();

    bookmarkService = app.get<BookmarkService>(BookmarkService);
    prisma = app.get<PrismaService>(PrismaService);

    // await prisma.onModuleInit(); //* we don't need to do it because default prisma will auto connect when the prisma module init right (maybe)
    await prisma.cleanDatabase();
  });

  afterAll(async () => {
    // * after all we need to close the connect DB right
    await prisma.cleanDatabase();
    await prisma.onModuleDestroy();
  });

  describe('get all bookmarks', () => {
    describe('the bookmarks data is empty in DB', () => {
      it('should return an empty array', async () => {
        const bookmarks = await bookmarkService.getBookmarks();

        expect(bookmarks).toStrictEqual({ bookmarks: [] });
      });
    });

    describe('the bookmarks data is in DB', () => {
      it('should return a list of bookmarks', async () => {
        const { id } = await prisma.user.create({
          data: userInput,
        });
        userId = id;

        const { bookmark } = await bookmarkService.createBookmark({
          ...bookmarkInput,
          userId: userId,
        });

        bookmarkId = bookmark.id;

        const bookmarks = await bookmarkService.getBookmarks();

        expect(bookmarks.bookmarks[0].title).toBe(bookmarkInput.title);
        expect(bookmarks.bookmarks[0].userId).toBe(userId);
      });
    });
  });

  describe('get a specific bookmark', () => {
    describe('give the invalid id', () => {
      it('should return a 404', async () => {
        await bookmarkService.getBookmark(123456).catch((err) => {
          // console.log(err.status);
          expect(err.status).toBe(404);
        });
      });
    });

    describe('give the valid id', () => {
      it('should return a bookmark', async () => {
        const { bookmark } = await bookmarkService.getBookmark(bookmarkId);

        expect(bookmark.id).toBe(bookmarkId);
      });
    });
  });

  describe('create a bookmark', () => {
    // describe('give the invalid input with duplicate unique field', () => {
    //   it('should return a prisma exception with code P2002', async () => {
    // P2002 represent for the error related to the duplicate unique field
    // duplicate user id
    // ! because in this bookmark data we don't have the unique field so we don't do the test for this case but maybe later on when we have the unique field on the bookmark schema then we can do this
    //     await bookmarkService
    //       .createBookmark({
    //         ...bookmarkInput,
    //         userId,
    //       })
    //       .catch((err) => {
    //         console.log(err.code);
    //         expect(err).toBeInstanceOf(PrismaClientKnownRequestError);
    //         expect(err.code).toBe('P2002');
    //       });
    //   });
    // });

    describe('give the invalid input with invalid foreign field', () => {
      it('should return a prisma exception with code P2003', async () => {
        // P2002 represent for the error related to the duplicate unique field
        // duplicate user id
        await bookmarkService
          .createBookmark({
            ...bookmarkInput,
            userId: 12346,
          })
          .catch((err) => {
            // console.log(err.code);
            expect(err).toBeInstanceOf(PrismaClientKnownRequestError);
            expect(err.code).toBe('P2003');
          });
      });
    });

    describe('give the invalid input', () => {
      it('should return a PrismaClientValidationError', async () => {
        // P2003 represent for validation error for the input in Prisma
        const { id } = await prisma.user.create({
          data: { ...userInput, email: 'test2@gmail.com' },
        });

        await bookmarkService
          .createBookmark({
            ...bookmarkInput,
            link: null,
            userId: id,
          })
          .catch((err) => {
            expect(err).toBeInstanceOf(PrismaClientValidationError);
          });
      });
    });

    describe('give the valid input', () => {
      it('should return a new bookmark', async () => {
        const { bookmark } = await bookmarkService.createBookmark({
          ...bookmarkInput,
          userId,
        });

        expect(bookmark.userId).toBe(userId);
      });
    });
  });

  describe('update a bookmark', () => {
    describe('give the invalid id', () => {
      it('should return a 404', async () => {
        // await expect(
        //   bookmarkService.updateBookmark(123456, bookmarkInput),
        // ).rejects.toThrow();

        await bookmarkService
          .updateBookmark(123456, { ...bookmarkInput, userId })
          .catch((err) => {
            // console.log(err.status);
            expect(err.status).toBe(404);
          });
      });
    });

    describe('give the valid id but the invalid input with invalid foreign field', () => {
      it('should return a prisma exception with code P2003', async () => {
        try {
          await bookmarkService.updateBookmark(bookmarkId, {
            ...bookmarkInput,
            userId: 123456,
          });
        } catch (err) {
          // console.log(err.code);
          expect(err).toBeInstanceOf(PrismaClientKnownRequestError);
          expect(err.code).toBe('P2003');
        }
      });
    });

    describe('give the valid id but the invalid input', () => {
      it('should return a PrismaClientValidationError', async () => {
        try {
          await bookmarkService.updateBookmark(bookmarkId, {
            ...bookmarkInput,
            link: null,
          });
        } catch (err) {
          // console.log(err);
          expect(err).toBeInstanceOf(PrismaClientValidationError);
        }
      });
    });

    describe('give the valid id and the valid input', () => {
      it('should return a updated bookmark', async () => {
        const { bookmark } = await bookmarkService.updateBookmark(
          bookmarkId,
          bookmarkInput,
        );

        expect(bookmark.title).toBe(bookmarkInput.title);
        expect(bookmark.id).toBe(bookmarkId);
      });
    });
  });

  describe('delete a bookmark', () => {
    describe('give the invalid id', () => {
      it('should return a 404', async () => {
        await bookmarkService.deleteBookmark(123456).catch((err) => {
          // console.log(err);
          expect(err.status).toBe(404);
        });
      });
    });
    describe('give the valid id', () => {
      it('should return null', async () => {
        const result = await bookmarkService.deleteBookmark(bookmarkId);
        // console.log(result);
        expect(result).toBeNull();
      });
    });
  });
});
