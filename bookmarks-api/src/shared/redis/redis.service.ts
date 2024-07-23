import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  set(key: string, value: any) {
    return this.cacheManager.set(key, value);
  }

  get(key: string) {
    return this.cacheManager.get(key);
  }

  delete(key: string) {
    return this.cacheManager.del(key);
  }

  reset() {
    return this.cacheManager.reset();
  }
}
