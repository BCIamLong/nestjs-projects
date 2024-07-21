import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService extends ConsoleLogger {
  constructor() {
    super();
  }
  // * by default we can't use the built-in logger of NestJS as dependencies injection, and one of the reason that because we usually test logger right and dependencies injection is maybe make the testing process better
  // * and to use dependencies injection we need to create the custom logger like this
  // * https://docs.nestjs.com/techniques/logger we can see on the doc
}
