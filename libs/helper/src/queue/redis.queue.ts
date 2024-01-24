import { z } from 'zod';
import { RedisService } from '../global/redis.service';
import { Injectable } from '@nestjs/common';

export type QueueEntry<T> = {
  executionId: string;
  definition: T;
};

export const QueueEntry = <T>(schema: z.ZodSchema<T>) =>
  z.object({
    executionId: z.string(),
    definition: schema,
  });

@Injectable()
export abstract class RedisQueue<T extends z.AnyZodObject> {
  private static readonly PREFIX = 'queue:';

  protected abstract readonly KEY: string;
  protected abstract readonly SCHEMA: T;

  constructor(private readonly redis: RedisService) {}

  async read(): Promise<QueueEntry<z.infer<T>> | null> {
    const entry = await this.redis.dequeue(RedisQueue.PREFIX + this.KEY);
    if (entry === null) {
      return null;
    }

    return QueueEntry(this.SCHEMA).parse(JSON.parse(entry));
  }

  push(executionId: string, definition: z.infer<typeof this.SCHEMA>) {
    const entry = QueueEntry(this.SCHEMA).parse({
      executionId,
      definition,
    });

    return this.redis.enqueue(
      RedisQueue.PREFIX + this.KEY,
      JSON.stringify(entry),
    );
  }
}
