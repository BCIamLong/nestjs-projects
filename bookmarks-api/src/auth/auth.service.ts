import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { hash, verify } from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO, SignupDTO, ValidateDTO } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
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
    // delete user.password;
    // delete user.passwordConfirm;

    // const payload = {
    //   sub: user.id,
    //   email,
    // };

    // const token = await this.jwt.signAsync(payload, {
    //   secret: this.config.get('JWT_ACCESS_TOKEN_SECRET'),
    //   expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRES'),
    // });

    // return token;
    return this.signToken({ sub: user.id, email });
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
      // delete newUser.password;
      // delete newUser.passwordConfirm;

      // return newUser;
      return this.signToken({ sub: newUser.id, email });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        if (err.code === 'P2002')
          throw new ForbiddenException('Credentials taken');

      throw err;
    }
  }

  async signToken(payload: { sub: number; email: string }) {
    const token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRES'),
    });

    return { status: 'success', token };
  }

  // * only use when we want to use local strategy so login with username now we don't have username so just use the first name for that
  async validateUser({ username, password }: ValidateDTO) {
    // const user = await this.prisma.user.findUnique({
    //   where: {
    //     name: username,
    //   },
    // });
    // ! remember we use findUnique because now i just  use name for replacement of the username so username is unique and we can use findUnique but name is not so let's just use find first instead
    // ! and later on if we want to use this function we will change to use
    const user = await this.prisma.user.findFirst({
      where: {
        name: username,
      },
    });

    if (!user) throw new NotFoundException('User is not exist');

    const verifyLogin = await verify(user.password, password);

    if (!verifyLogin) throw new BadRequestException('Password is invalid');

    // return user;
    return user;
  }
}
