import {
  Injectable,
  Logger,
  LoggerService,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger: LoggerService = new Logger('HTTP');

  // ! LOGGER is default it doesn't implement dependencies injection by NestJS because when we use dependencies injection we separate everything right and it's easy to manipulate and standalone and also easy to test
  // * But when we test we doesn't need to test logger right, it's like external and therefore NestJS doesn't implement it as dependencies injection
  // * That's why we can't use it as dependencies injection
  // ! But we can do that by create custom logger and implement it as dependencies injection
  // * https://docs.nestjs.com/techniques/logger  we can read doc here
  constructor() {}

  use(req: Request, res: Response, next: NextFunction) {
    // * https://github.com/stuyy/nestjs-crash-course/blob/master/src/users/users.module.ts see more about how we can implement middleware
    // * https://docs.nestjs.com/middleware
    // * https://www.youtube.com/watch?v=xzu3QXwo1BU
    // * https://github.com/stuyy/nestjs-crash-course/blob/master/src/users/middlewares/example.middleware.ts

    const { originalUrl, ip, method } = req;
    const userAgent = req.get('user-agent') || '';
    const { statusCode } = res;
    const contentLength = res.get('content-length') || '';
    // * so this is the request logger basically it likes kind of morgan when we use for morgan('dev') in our express app right
    // * https://docs.nestjs.com/techniques/logger

    this.logger.log(
      `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
    );

    next();
  }
}
