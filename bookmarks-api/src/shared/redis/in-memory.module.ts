import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

// * by default nestjs use in memory store to store our cached data, and this in memory store will ony persist the data while the app is running
// * so if we stop the app then every cached data will lost
// ! But with redis we store the data to redis cache memory so it’s different with the in memory our app use then when we restart our app our cache is still persist unless we shutdown our desktop (that time the redis cached data will lost)
// * https://docs.nestjs.com/techniques/caching read this for the usage

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
  ],
})
export class InMemoryCacheModule {}
