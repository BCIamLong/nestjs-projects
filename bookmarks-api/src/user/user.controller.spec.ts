import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
// import '../auth/decorators';
import { RolesGuard } from 'src/common/guards';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AccessControlService } from 'src/shared/access-control.service';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWTStrategy } from 'src/auth/strategies';

describe('UserController', () => {
  // ---------------------------------
  let userController: UserController;
  let userService: UserService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let jwtStrategy: JWTStrategy;
  const userId = 123;
  const userPayload = { sub: userId, email: 'user@gmail.com' };

  const userInput = {
    email: 'test@gmail.com',
    name: 'Test User',
    role: 'user',
    password: 'test123',
  };
  const invalidUserInput = {
    email: '',
    name: 'Test User',
    role: 'user',
    password: 'test123',
  };

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
      // ! remember that always provide all the providers we need for the thing we test like modules (imports),controllers, providers, service (other type of injectable when we use @Injectable decorator that thing is injectable type)
      providers: [
        UserService,
        RolesGuard,
        Reflector,
        PrismaService,
        ConfigService,
        AccessControlService,
        JwtService,
        JWTStrategy,
      ],
    }).compile();

    // ! and notice that we should take the services, providers, controllers, modules... from this testing module why? well because we are mock the testing module which contains all the modules, providers for it works like and we use it to test
    // ! therefore it's good to take those things from the testing module and mock things easier
    userController = app.get<UserController>(UserController);
    prisma = app.get<PrismaService>(PrismaService);
    jwt = app.get<JwtService>(JwtService);
    jwtStrategy = app.get<JWTStrategy>(JWTStrategy);
    userService = app.get<UserService>(UserService);
  });

  describe('getMe', () => {
    describe("give the user doesn't exist", () => {
      it('should return a 401', async () => {
        jest
          .spyOn(prisma.user, 'findUnique')
          .mockRejectedValue(new UnauthorizedException());

        try {
          await jwtStrategy.validate(userPayload);
          await userController.getMe(user);
        } catch (err) {
          expect(err.status).toBe(401);
        }
      });
    });
    describe("give the user doesn't login", () => {
      it('should return a 401', async () => {
        jest
          .spyOn(jwt, 'verify')
          .mockRejectedValue(new UnauthorizedException() as never);

        try {
          await jwt.verify('invalid-token');
          await jwtStrategy.validate(userPayload);
          await userController.getMe(user);
        } catch (err) {
          expect(err.status).toBe(401);
        }
      });
    });
    // ! so notice this is not pure unit test because i write some logic test for authenticate process here, so if it's pure we should test for getMe controller
    // ! and for authenticate it's like middleware in express right, so therefore we can test for the JwtStrategy logic so that's it better
    describe('give the user login', () => {
      it('should return a 401', async () => {
        jest.spyOn(jwt, 'verify').mockResolvedValue(true as never);
        jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

        await jwt.verify('invalid-token');
        await jwtStrategy.validate(userPayload);
        const result = await userController.getMe(user);

        expect(result).toStrictEqual(user);
      });
    });
  });

  describe('updateMe', () => {
    describe('give the invalid user id', () => {
      it('should return a 401', async () => {
        jest
          .spyOn(userService, 'updateMe')
          .mockRejectedValue(new NotFoundException());

        try {
          await userController.updateMe(user, userInput);
        } catch (err) {
          // console.log(err);
          expect(userService.updateMe).toHaveBeenCalledWith(user.id, userInput);
          expect(err.status).toBe(404);
        }
      });
    });

    describe('give the valid user id but the invalid input', () => {
      it('should return a 400', async () => {
        jest
          .spyOn(userService, 'updateMe')
          .mockRejectedValue(new BadRequestException());

        try {
          await userController.updateMe(user, invalidUserInput);
        } catch (err) {
          // console.log(err);
          expect(userService.updateMe).toHaveBeenCalledWith(
            user.id,
            invalidUserInput,
          );
          expect(err.status).toBe(400);
        }
      });
    });

    describe('give the valid user id but the valid input', () => {
      it('should return a updated user', async () => {
        jest.spyOn(userService, 'updateMe').mockResolvedValue({ user });

        await expect(
          userController.updateMe(user, userInput),
        ).resolves.toStrictEqual({ user });

        expect(userService.updateMe).toHaveBeenCalledWith(user.id, userInput);
      });
    });
  });
});
