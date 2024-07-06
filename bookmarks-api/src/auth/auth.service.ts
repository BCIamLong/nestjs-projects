import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { hash, verify } from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO, SignupDTO } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async login({ email, password }: LoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException('User is not exist');

    const verifyLogin = await verify(user.password, password);

    if (!verifyLogin) throw new BadRequestException('Password is invalid');

    // * now we do some dirty way to filter the fields we want to return but later on we will use the way with class transformer to do it
    // * we can also use select option in query of prisma but it's really suite for when we want to read data so select data right, of course in this case we're reading but we need to use password later to verify login password right so therefore we need to do it like it
    // * but it's better if we do with class transformer
    delete user.password;
    delete user.passwordConfirm;

    return user;
  }

  async signup({ email, password }: SignupDTO) {
    try {
      const hashPwd = await hash(password);
      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: hashPwd,
        },
      });

      // * now we do some dirty way to filter the fields we want to return but later on we will use the way with class transformer to do it
      // * we can also use select option in query of prisma but it's really suite for when we want to read data so select data right
      delete newUser.password;
      delete newUser.passwordConfirm;

      return newUser;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        if (err.code === 'P2002')
          throw new ForbiddenException('Credentials taken');

      throw err;
    }
  }
}
