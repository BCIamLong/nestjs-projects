import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { ResponseInterceptor } from './common/interceptors';
import { AccessTokenGuard } from './auth/guards';
import { SharedModule } from './shared/shared.module';
import { AllExceptionFilter } from './common/filters';
import {
  JSONBodyMiddleware,
  LoggerMiddleware,
  RawBodyMiddleware,
} from './common/middlewares';
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
// import { EventEmitterModule } from '@nestjs/event-emitter';
// import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BookmarkModule,
    // EventEmitterModule.forRoot(),
    PrismaModule,
    // * this config module here is just like we use dotenv and get the env variables from .env file
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    // ThrottlerModule.forRoot([  //! way 1
    // * https://docs.nestjs.com/security/rate-limiting
    // * https://www.npmjs.com/package/@nestjs/throttler/v/2.0.1
    //   {
    //     ttl: 15 * 60 * 1000, //* 15 minutes (unit = milliseconds)
    //     limit: 10,
    //   },
    // ]),
    // * this is for if we want to inject providers to do something like this case we inject the config to get the env variables
    // ! if we want to do just the way normal and don't need to inject other service like in this case we can use the way above so (way 1)
    // *  // * https://www.npmjs.com/package/@nestjs/throttler/v/2.0.1 read this to see more
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => {
        return {
          throttlers: [
            {
              ttl: Number(config.get('RATE_LIMIT_TTL')),
              limit: Number(config.get('RATE_LIMIT_SLOTS')),
            },
          ],
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,

    // ! we have two ways to implement global thing so we can do it in the main.ts but it will not able to use dependencies injection therefore we need to do manually like insatiate the dependency and then pass them to the constructor like new A(so here)
    // ! but we can also do it in the App module like the way bellow but more flexible so it will be able for dependencies injection and we don't need to manually insatiate and pass it manually
    // * recap we should use global thing in main.ts when our provider is simple and doesn't need more dependencies inject
    // * but if the provider need to inject more dependencies then app module way for global things is absolute better

    // * we can use interceptor in the just for app module so include all the modules in our app like this
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    // * for global interceptor use in main.ts we use use it for like logger or maybe if we have more service and not only our app and we have interceptors for that then we can apply global as i did before right
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_FILTER, useClass: AllExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // * https://github.com/stuyy/nestjs-crash-course/blob/master/src/users/users.module.ts see more about how we can implement middleware
    // * https://docs.nestjs.com/middleware
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*')
      // consumer.apply(LoggerMiddleware).forRoutes('users', 'bookmarks', 'auth');
      // * THE CODE BELLOW IS HOW WE USE BODY RAW IN NESTJS
      // * so nest js by default it will use bodyParser on all routes but in this time we need the body raw and it doesn't setup as the default
      // * the solution is turn off the default bodyParser and instead we will create the RawBodyMiddleware for raw body data like we use bodyParser.raw() in express app as we did before right
      // * and the JSONBodyMiddleware of course for the body json object data right
      // ! so basically we turn off the default and setup it again but with the new thing right
      // *https://stackoverflow.com/questions/54346465/access-raw-body-of-stripe-webhook-in-nest-js
      .apply(RawBodyMiddleware)
      .forRoutes({
        path: '/stripe-webhook-checkout',
        method: RequestMethod.POST,
      })
      .apply(JSONBodyMiddleware)
      .forRoutes('*');
  }
}
