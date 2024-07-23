import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { RedisService } from './redis.service';

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
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
