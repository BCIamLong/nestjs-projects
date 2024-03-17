import { NestFactory } from '@nestjs/core';
import { ComputerModule } from './computer/computer.module';

// * now our computer module is our main module not AppModule because now we don't need it and also removed it
async function bootstrap() {
  const app = await NestFactory.create(ComputerModule);
  await app.listen(3000);
}
bootstrap();
