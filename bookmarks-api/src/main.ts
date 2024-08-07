import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { LoggerService } from './shared/logger/logger.service';
// import { HttpExceptionFilter } from './common/filters';
// import { AllExceptionFilter } from './common/filters/all-exception.filter';
// import { AccessTokenGuard } from './auth/guards';
// import { ResponseInterceptor } from './common/interceptors';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  app.useLogger(app.get(LoggerService));

  app.use(helmet()); // * https://docs.nestjs.com/security/helmet

  app.use(cookieParser());

  // * in this case we just want to use the interceptor for response in our app module so for all modules in our app then we can put it in app module not necessary to put it here
  // * this global interceptor usually for logger and maybe effect to other service or something outside of our app module
  // * notice that if we use as interceptor as global and in that interceptor we have used Reflector provider then we need to provide it like the code bellow
  // * if we use it as in the App module then we don't need instead we follow the way to provide the interceptor and this Reflector is automatically apply for app module
  // app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));

  // app.useGlobalGuards(new AccessTokenGuard(new Reflector()));

  app.useGlobalPipes(
    new ValidationPipe({
      // * with white list set to true we only accept the fields we declare in DTO
      // * for example our DTO is {name, password}
      // * then if the body is {name, password, id} -> it will strip out and the result is {name, password}
      // * so that's the useful of white list it helps us to prevent the data injection to the body right
      whitelist: true,
    }),
  );

  // * https://docs.nestjs.com/security/cors
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalFilters(new AllExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Bookmarks API')
    .setDescription(
      'The Bookmarks API help people can bookmark something they want',
    )
    .setVersion('1.0')
    .addTag('Bookmarks API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document);
  SwaggerModule.setup('api-doc', app, document, {
    jsonDocumentUrl: 'api-doc/json',
  });

  const port = process.env.PORT || 5000;

  await app.listen(port);
  logger.log(`Server is listening at port ${port}`);
  logger.log(`Server is available at http://localhost:${port}`);
}
bootstrap();
