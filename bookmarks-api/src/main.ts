import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ResponseInterceptor());

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
