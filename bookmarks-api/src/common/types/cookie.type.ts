import { CookieOptions } from 'express';

// export interface SetCookie {
//   (name: string, val: string | object, options?: CookieParseOptions): Response;
// }

export type SetCookieFnc = (
  name: string,
  val: string | object,
  options?: CookieOptions,
) => Response;
