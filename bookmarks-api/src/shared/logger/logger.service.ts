import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService extends ConsoleLogger {
  constructor() {
    super();
  }
  // * by default we can't use the built-in logger of NestJS as dependencies injection, and one of the reason that because we usually test logger right and dependencies injection is maybe make the testing process better
  // * and to use dependencies injection we need to create the custom logger like this
  // * https://docs.nestjs.com/techniques/logger we can see on the doc

  // * so basically when we want to tell nestjs we use global logger it quite different with other like pipes, guards... because Nest doesn't implement for the global logger
  // ! therefore we need to do 2 things:
  // * 1: create custom logger and setup it as global module and we can inject the logger in everywhere in our app like in this case we create the logger module and imports it to the shared module which is the global module share in app module right
  // * 2: we need to tell NestJS that we want to use the global logger by do it in main.ts
  // * app.useLogger(app.get(LoggerService));
  // * and also set the bufferLogs option to true like bellow
  // const app = await NestFactory.create(AppModule, {
  //   bufferLogs: true,
  // });
  // * In the example above, we set the bufferLogs to true to make sure all logs will be buffered until a custom logger is attached (MyLogger in this case) and the application initialisation process either completes or fails. If the initialisation process fails, Nest will fallback to the original ConsoleLogger to print out any reported error messages. Also, you can set the autoFlushLogs to false (default true) to manually flush logs (using the Logger#flush() method).
  // * https://docs.nestjs.com/techniques/logger#dependency-injection we can read here

  // ? -------------- WE WILL CUSTOM THIS LOGGER WITH MAYBE WINSTON IN THE FUTURE -----------------
}
