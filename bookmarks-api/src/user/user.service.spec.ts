import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let prisma: PrismaService;
  const userId = 123;
  // const userPayload = { sub: userId, email: 'user@gmail.com' };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService, ConfigService],
    }).compile();

    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('updateMe', () => {
    describe('give the invalid user id', () => {
      it('should return a 401', async () => {
        jest
          .spyOn(prisma.user, 'update')
          .mockRejectedValue(new UnauthorizedException());

        try {
          await userService.updateMe(userId, userInput);
        } catch (err) {
          expect(prisma.user.update).toHaveBeenCalledTimes(1);
          expect(err.status).toBe(401);
        }
      });
    });

    describe('give the valid user id but the invalid input', () => {
      it('should return a 400', async () => {
        jest
          .spyOn(prisma.user, 'update')
          .mockRejectedValue(new BadRequestException());

        try {
          await userService.updateMe(userId, invalidUserInput);
        } catch (err) {
          expect(prisma.user.update).toHaveBeenCalledTimes(1);
          expect(err.status).toBe(400);
        }
      });
    });

    describe('give the valid user id and the valid input', () => {
      it('should return an updated user', async () => {
        jest.spyOn(prisma.user, 'update').mockResolvedValue(user);

        await expect(
          userService.updateMe(userId, userInput),
        ).resolves.toStrictEqual({
          user,
        });

        expect(prisma.user.update).toHaveBeenCalledTimes(1);
      });
    });
  });
});
