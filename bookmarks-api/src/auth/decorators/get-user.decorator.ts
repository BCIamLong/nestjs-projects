import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  // * remember that we can't make the data?: string because the optional only be the last param in this case that's ctx so we don't override it therefore we do something instead bellow
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // * the idea is when we use @GetUser('data') => data will be 'data'
    // * and we can use this idea to return certain fields if we want
    if (data) return request.user[data]; // request.user['email'] => return email of user right

    return request.user;
  },
);
