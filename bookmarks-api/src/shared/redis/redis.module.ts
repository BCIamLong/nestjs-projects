import {
  // CacheInterceptor,
  CacheModule,
  CacheStore,
} from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { RedisService } from './redis.service';
// import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    // CacheModule.register({
    //   isGlobal: true,
    //   useFactory: async () => ({
    //     store: redisStore as any,
    //     host: 'localhost',
    //     port: 6379,
    //     // ttl: 1000,
    //   }),
    // }),

    // CacheModule.register({
    //   store: redisStore as unknown as CacheStore,
    //   host: 'localhost',
    //   port: 6379,
    //   isGlobal: true,
    // }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        // * https://stackoverflow.com/questions/73908197/typeerror-store-get-is-not-a-function-nestjs-cache-manager

        // ! if we got another error then just google

        // * the error store.get is not the function in this case because we use:
        // * import * as redisStore from 'cache-manager-redis-store'; from the doc but it will be error if we use the newest version maybe: https://docs.nestjs.com/techniques/caching
        // * the cache-manager-redis-store is updated and now it has the redisStore object and we don't need to do something like above like import * as redisStore so it will error right
        isGlobal: true,
        // * the error we get with this type of redisStore we just use this trick bellow to fix the type error
        store: redisStore as unknown as CacheStore,
        socket: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
        },
        // store: (): any =>
        //   redisStore({
        //     socket: {
        //       host: config.get('REDIS_HOST'),
        //       port: config.get('REDIS_PORT'),
        //     },
        //   }),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    RedisService,
    // {
    // * of course we can use this right here because we will import this to the shared module which is the global module we will import to the app module
    // ! but we should use this in our app for more readable right
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ],
  // ! we need to export cache module here why?
  // ! because if we want to use CacheInterceptor we need the cache module setup but now if we don't explore then this setup only work in this range of the redis module not for other modules right
  // * therefore we need to export it also to use something like CacheInterceptor..., because if we don't do it we will catch the error that's we don't have CACHE_MANAGER basically reference to the CacheModule
  // * this like we do CacheModule.registerAsync() in the app module but now we do this setup right here then just export it to the shared global module which is imports to app module and it will work just well
  exports: [RedisService, CacheModule],
})
export class RedisModule {}
