import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkController } from 'src/bookmark/bookmark.controller';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BookmarkServiceTest } from 'src/bookmark/bookmark-test.service';

describe('Bookmark (integration)', () => {
  let bookmarkService: BookmarkService;
  let prisma: PrismaService;

  const bookmarkInput = {
    title: 'Test Bookmark',
    description: 'Description',
    link: 'link',
    userId: 1,
  };

  const userInput = {
    email: 'test@gmail.com',
    name: 'Test User',
    role: 'user',
    password: 'test123',
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
        await prisma.user.create({
          data: userInput,
        });

        await bookmarkService.createBookmark(bookmarkInput);

        const bookmarks = await bookmarkService.getBookmarks();

        expect(bookmarks.bookmarks[0].title).toBe(bookmarkInput.title);
      });
    });
  });
});
