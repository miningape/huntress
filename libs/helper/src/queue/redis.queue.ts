import { z } from 'zod';
import { RedisService } from '../global/redis.service';

export type QueueEntry<T> = {
  executionId?: string;
  definition?: T;
};

export const QueueEntry = <T>(schema: z.ZodSchema<T>) =>
  z.object({
    executionId: z.string(),
    definition: schema,
  });

export abstract class RedisQueue<T extends z.AnyZodObject> {
  protected abstract readonly KEY: string;
  private static readonly PREFIX = 'queue:';

  constructor(
    private readonly schema: T,
    private readonly redis: RedisService,
  ) {}

  async read(): Promise<QueueEntry<z.infer<T>> | null> {
    const entry = await this.redis.dequeue(RedisQueue.PREFIX + this.KEY);
    if (entry === null) {
      return null;
    }

    return QueueEntry(this.schema).parse(JSON.parse(entry));
  }

  push(executionId: string, definition: any) {
    const entry = QueueEntry(this.schema).parse({
      executionId,
      definition,
    });

    return this.redis.push(RedisQueue.PREFIX + this.KEY, JSON.stringify(entry));
  }
}
