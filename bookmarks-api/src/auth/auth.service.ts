import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { hash, verify } from 'argon2';

import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDTO, SignupDTO, ValidateDTO } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';
import { AppMailerService } from 'src/shared/mailer/mailer.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from 'src/common/events';

@Injectable({})
export class AuthService {
  // * Instead of inject the config service to the auth controller and get env variables to set up something we can do it right here in our service because we already inject the config service in here
  // * and we can leverage this and setup everything here which needs the env variable by using config service and later in controller we can inject this and also use these variables right
  // * instead of inject the config service to the controller and do something right
  access_token_expires: string;
  refresh_token_expires: string;
  commonCookieOptions: CookieOptions;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailService: AppMailerService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.access_token_expires = config.get('JWT_ACCESS_TOKEN_EXPIRES');
    this.refresh_token_expires = config.get('JWT_REFRESH_TOKEN_EXPIRES');
    this.commonCookieOptions = {
      httpOnly: true,
      secure: config.get('NODE_ENV') === 'production',
    };
  }
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
    return this.signToken('access-token', { sub: user.id, email });
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
      return this.signToken('access-token', { sub: newUser.id, email });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        if (err.code === 'P2002')
          throw new ForbiddenException('Credentials taken');

      throw err;
    }
  }

  async signToken(
    type: 'access-token' | 'refresh-token',
    payload: { sub: number; email: string },
  ) {
    const tokenPromise =
      type === 'access-token'
        ? this.jwt.signAsync(payload, {
            secret: this.config.get('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: this.access_token_expires,
          })
        : this.jwt.signAsync(payload, {
            secret: this.config.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.refresh_token_expires,
          });

    const token = await tokenPromise;

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

  async signup1({ email, password }: SignupDTO) {
    try {
      const hashPwd = await hash(password);
      const newUser = await this.prisma.user.create({
        data: {
          email,
          password: hashPwd,
        },
      });
      // * now when we signup we want to send the welcome email or the verify email to the user right
      // * but the email process will take some time to do right and if we do it in the same place like this it can be make the process signup lower and the user doesn't want that so they want it fast right
      // * and therefore it can be problem and make the bad UX
      // * to solve this problem we can use something call event emitter so basically it will implement the event emit pattern and it's kind of like the event emit in nodejs what we did before
      // * https://docs.nestjs.com/techniques/events
      // * so when we sign up we emit the event to send mail but we don't block the process then the user get the response while the event happen and the send mail happens
      // * so it's run on other thread therefore it doesn't affect to this signup current thread right
      // * of course we can decouple our code to easy to manage by using this event emit pattern when our code grow too big right

      return this.setupTokens({ id: newUser.id, email });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        if (err.code === 'P2002')
          throw new ForbiddenException('Credentials taken');

      throw err;
    }
  }

  async login1({ email, password }: LoginDTO) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) throw new NotFoundException('User is not exist');

      //****************************************** */
      // this.mailService.sendEmail(
      //   {
      //     to: email,
      //     text: 'Hello',
      //     subject: 'Hello',
      //   },
      //   user,
      // );
      // * to really ensure the type of the payload is pass true we can create the class and use it to create the payload and then use it as type as the receiver to check that payload type
      // * in this case we make sure we will use UserCreatedEvent payload type so make sure people pass something really true
      // * https://www.youtube.com/watch?v=btLyiMUs_Cw&t=565s can watch at the events part
      this.eventEmitter.emit(
        'user.created',
        new UserCreatedEvent('Welcome to the bookmarks app', user),
      );
      // this.eventEmitter.emit('user.created', {
      //   subject: 'Welcome to the bookmarks app',
      //   user,
      // });

      const verifyLogin = await verify(user.password, password);

      if (!verifyLogin) throw new BadRequestException('Password is invalid');

      // * create access token and refresh token
      const accessTokenObj = await this.signToken('access-token', {
        sub: user.id,
        email,
      });

      const refreshTokenObj = await this.signToken('refresh-token', {
        sub: user.id,
        email,
      });

      // * set these tokens to cookie

      // * hash refresh token and store in the DB by update hashedRt field on the user
      const hashedRt = await hash(refreshTokenObj.token);

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          hashedRt,
        },
      });

      // * return response only include the access token

      return { accessTokenObj, refreshTokenObj };
      // return accessTokenObj;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025')
          throw new UnauthorizedException('Access denied');
      }
    }
  }

  async logout(id: number) {
    try {
      await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          hashedRt: null,
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025')
          throw new UnauthorizedException('Access denied');
      }
    }
  }

  async refresh(id: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user || !user.hashedRt)
      //* we also don't allow the user doesn't have hashedRt to pass right and user must to login again to have the hashedRt right
      throw new UnauthorizedException('Access denied');

    const verifyRefreshToken = await verify(user.hashedRt, refreshToken);

    if (!verifyRefreshToken) throw new UnauthorizedException('Access denied');

    const decoded = await this.jwt.decode(refreshToken);

    // console.log(decoded.exp * 1000, Date.now());
    // decoded.exp (s) => we need to time 1000 to make it as ms as the unit of Date.now()
    if (decoded.exp * 1000 < Date.now())
      throw new UnauthorizedException('Access denied');
    // console.log(decoded); // = { sub: 5, email: 'b@gmail.com', iat: 1720603503, exp: 1721208303 }

    const accessTokenObj = await this.signToken('access-token', {
      sub: id,
      email: user.email,
    });

    // * set access token to cookie

    return accessTokenObj;
  }

  async setupTokens({ id, email }: { id: number; email: string }) {
    // * create access token and refresh token
    const accessTokenObj = await this.signToken('access-token', {
      sub: id,
      email,
    });

    const refreshTokenObj = await this.signToken('refresh-token', {
      sub: id,
      email,
    });

    // * set these tokens to cookie

    // * hash refresh token and store in the DB by update hashedRt field on the user
    const hashedRt = await hash(refreshTokenObj.token);

    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        hashedRt,
      },
    });

    // * return response only include the access token

    return { accessTokenObj, refreshTokenObj };
  }
}
