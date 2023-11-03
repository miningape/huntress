import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis();
  }

  push(key: string, value: string) {
    return this.redis.rpush(key, value);
  }

  dequeue(key: string): Promise<string | null> {
    return this.redis.lpop(key);
  }
}
