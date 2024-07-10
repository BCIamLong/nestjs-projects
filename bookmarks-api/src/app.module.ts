import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors';
import { AccessTokenGuard } from './auth/guards';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BookmarkModule,
    PrismaModule,
    // * this config module here is just like we use dotenv and get the env variables from .env file
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // ! we have two ways to implement global thing so we can do it in the main.ts but it will not able to use dependencies injection therefore we need to do manually like insatiate the dependency and then pass them to the constructor like new A(so here)
    // ! but we can also do it in the App module like the way bellow but more flexible so it will be able for dependencies injection and we don't need to manually insatiate and pass it manually
    // * recap we should use global thing in main.ts when our provider is simple and doesn't need more dependencies inject
    // * but if the provider need to inject more dependencies then app module way for global things is absolute better

    // * we can use interceptor in the just for app module so include all the modules in our app like this
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    // * for global interceptor use in main.ts we use use it for like logger or maybe if we have more service and not only our app and we have interceptors for that then we can apply global as i did before right
    { provide: APP_GUARD, useClass: AccessTokenGuard },
  ],
})
export class AppModule {}
