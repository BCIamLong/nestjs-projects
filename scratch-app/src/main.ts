import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

// @Controller()
// class AppController {
//   @Get()
//   getRootRoute() {
//     return "Hello world";
//   }
// }

// @Module({ controllers: [AppController] })
// class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.listen(3000);
}

bootstrap();
