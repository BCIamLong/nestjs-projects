import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

jest.mock('../auth/decorators');
import '../auth/decorators';

describe('UserController', () => {
  // ---------------------------------
  let userController: UserController;

  const user = {
    id: 123,
    email: 'test@gmail.com',
    name: 'Test User',
    role: 'user',
    password: 'test123',
    passwordConfirm: 'test123',
    hashedRt: '123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // ------------------------------------

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    userController = app.get<UserController>(UserController);
  });

  describe('UserController', () => {
    describe('getMe', () => {
      describe("give the user doesn't login", () => {
        it('should return a 401 status code', () => {
          expect(userController.getMe(user)).toBe(401);
        });
      });
    });
  });
});
