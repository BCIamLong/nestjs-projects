import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  // UnauthorizedException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// * we can use filter to custom the default errors handler of nest js

// * so nest js is by default implemented the global errors handler like we did in express js app usually and if we want to custom this so we don't want to use this default global error handler
// * we can custom it as the filter and use this filter as the global filter

// * with global response we can use the interceptor and custom it then use this interceptor as global interceptor and it will be the global response for us

// @Catch(HttpException) //* only catch for HttpException

// * because i don't want to only catch the http exception but also maybe another exception like UNHANDLED REJECTION, UNCAUGHT EXCEPTION ...
// * so therefore we can declare @Catch() so it will catch for any exception
// * so if we use @Catch(HttpException) it will catch for specific exception right in this case that's HttpException

// ! this is not pure http exception
// * https://docs.nestjs.com/exception-filters#exception-filters-1 see this example
// * so a filter for http exception is just for handle http exception right
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor() {
    this.registerCatchAllExceptionsHook();
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // const request = ctx.getRequest();

    if (exception instanceof PrismaClientKnownRequestError) {
      let statusCode: number;
      let msg: string;
      if (exception.code === 'P2025') {
        statusCode = 401;
        msg = 'Access denied';
        // throw new UnauthorizedException('Access denied');
      }
      console.log(exception);
      response.status(statusCode).json({
        statusCode: statusCode,
        message: msg,
        error: exception,
        // timestamp: new Date().toISOString(),
        // path: request.url,
      });
    }
    // console.log(exception.getResponse());
    // const msg = exception.message;
    const status = exception.getStatus();
    const defaultRes = exception.getResponse();

    response.status(status).json(defaultRes);

    // response.status(status).json({
    //   statusCode: status,
    //   message: msg,
    //   timestamp: new Date().toISOString(),
    //   path: request.url,
    // });
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
