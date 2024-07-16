import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// ! this set cookie decorator is not work the idea is simple just take the cookie from res to use and not use res directly
export const SetCookie = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const res = ctx.switchToHttp().getResponse();

    return res.cookie;
  },
);
