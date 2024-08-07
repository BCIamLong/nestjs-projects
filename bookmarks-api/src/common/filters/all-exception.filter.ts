import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  // UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerException } from '@nestjs/throttler';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

// * we can use filter to custom the default errors handler of nest js

// * so nest js is by default implemented the global errors handler like we did in express js app usually and if we want to custom this so we don't want to use this default global error handler
// * we can custom it as the filter and use this filter as the global filter

// * with global response we can use the interceptor and custom it then use this interceptor as global interceptor and it will be the global response for us

// @Catch(HttpException) //* only catch for HttpException

// * because i don't want to only catch the http exception but also maybe another exception like UNHANDLED REJECTION, UNCAUGHT EXCEPTION ...
// * so therefore we can declare @Catch() so it will catch for any exception
// * so if we use @Catch(HttpException) it will catch for specific exception right in this case that's HttpException

// * let's see how we can make a handler for all exceptions
// * https://docs.nestjs.com/exception-filters#catch-everything

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private isDev: boolean;
  constructor(config: ConfigService) {
    this.isDev = config.get('NODE_ENV') === 'development';
    this.registerCatchAllExceptionsHook();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // const request = ctx.getRequest();
    const status = this.getStatus(exception);
    let defaultRes = {};
    let stack: unknown;

    if (status === HttpStatus.INTERNAL_SERVER_ERROR)
      defaultRes = { statusCode: 500, message: 'Something went wrong' };

    // * PRISMA EXCEPTIONS ------------------------------------------
    if (exception instanceof PrismaClientKnownRequestError) {
      let statusCode: number;
      let msg: string;
      stack = exception.stack;
      if (exception.code === 'P2025') {
        statusCode = 404;
        msg = 'No record found with this id';
        // throw new UnauthorizedException('Access denied');
      }

      if (exception.code === 'P2002') {
        // * duplicate unique field error
        statusCode = 400;
        msg = 'The data you enter is already taken';
      }

      if (exception.code === 'P2003') {
        // status = 400;
        statusCode = 400;
        msg = 'The input data is invalid';
      }

      defaultRes = {
        statusCode,
        message: msg,
      };
    }
    if (exception instanceof PrismaClientValidationError) {
      defaultRes = {
        statusCode: 400,
        message: 'Bad request',
      };
    }
    // ---------------------------------------------------------------------------

    if (exception instanceof HttpException) {
      defaultRes = exception.getResponse();
      // console.log('ok====================');
      stack = exception.stack;
    }

    // * THROTTLER  EXCEPTION ------------------------------------------------------

    if (exception instanceof ThrottlerException) {
      // * because this ThrottlerException is also the type of HttpException therefore we can check this exception inside of the HttpException check, or combine condition of them
      // * but we can make it outside like this after the HttpException check
      defaultRes = {
        statusCode: 429,
        message: 'Too many requests',
      };
      // return response.status(status).json(defaultRes);
    }

    // ------------------------------------------------------------------------------

    if (this.isDev)
      defaultRes = {
        ...defaultRes,
        error: exception,
      };

    if (this.isDev && stack)
      defaultRes = {
        ...defaultRes,
        stack,
      };

    response.status(status).json(defaultRes);
  }

  getStatus(exception: unknown) {
    if (exception instanceof HttpException) return exception.getStatus();
    if (exception instanceof PrismaClientKnownRequestError)
      return HttpStatus.INTERNAL_SERVER_ERROR;

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  registerCatchAllExceptionsHook() {
    process.on(
      'unhandledRejection',
      (reason) => console.error('UNHANDLED REJECTION', reason),
      // process.exit(1)
    );

    process.on(
      'uncaughtException',
      (reason) => console.error('UNCAUGHT EXCEPTION', reason),
      // process.exit(1)
    );
  }
}
