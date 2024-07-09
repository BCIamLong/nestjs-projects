import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import { ResponseInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // * in this case we just want to use the interceptor for response in our app module so for all modules in our app then we can put it in app module not necessary to put it here
  // * this global interceptor usually for logger and maybe effect to other service or something outside of our app module
  // * notice that if we use as interceptor as global and in that interceptor we have used Reflector provider then we need to provide it like the code bellow
  // * if we use it as in the App module then we don't need instead we follow the way to provide the interceptor and this Reflector is automatically apply for app module
  // app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));

  app.useGlobalPipes(
    new ValidationPipe({
      // * with white list set to true we only accept the fields we declare in DTO
      // * for example our DTO is {name, password}
      // * then if the body is {name, password, id} -> it will strip out and the result is {name, password}
      // * so that's the useful of white list it helps us to prevent the data injection to the body right
      whitelist: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
