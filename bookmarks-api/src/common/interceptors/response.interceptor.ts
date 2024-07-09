import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skip = this.reflector.get<boolean>(
      'skipGlobalInterceptor',
      context.getHandler(),
    );
    if (skip) return next.handle();

    return next.handle().pipe(
      map((data) => ({
        status: 'success',
        data,
        // data: {
        //   data, //* not work it will because data: {user_id: 123 ....} we should use format return {users}, {user}... so with an object include the field name we want to return
        // },
      })),
    );
  }
}
