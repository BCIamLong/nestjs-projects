import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // * https://github.com/stuyy/nestjs-crash-course/blob/master/src/users/users.module.ts see more about how we can implement middleware
    // * https://docs.nestjs.com/middleware
    // * https://www.youtube.com/watch?v=xzu3QXwo1BU
    // * https://github.com/stuyy/nestjs-crash-course/blob/master/src/users/middlewares/example.middleware.ts
    console.log(req.originalUrl);
    next();
  }
}
