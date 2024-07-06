import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
// import { env } from 'process';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    // * we are using it in constructor so we don't need to do private config: ConfigService  in case we use in everywhere in our class right
    // * this config module here is just like we use dotenv and get the env variables from .env file, and config service is the injectable so what we can use dependence injection and use its functionality right
    // * so the place we can use dependence injection is service right because it's injectable by declare @Injectable decorator right
    super({
      datasourceUrl: config.get('DATABASE_URL'),
      // datasourceUrl: env.DATABASE_URL,
    });
  }
}
