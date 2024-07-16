import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCookies = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // request.cookie['jwt'] => return cookie of jwt

    return data ? request.cookies?.[data] : request.cookies;
  },
);
