import { Injectable } from '@nestjs/common';
import { RedisService } from '../global/redis.service';
import { z } from 'zod';
import { PipelineJob } from './pipeline.job';

export type QueueEntry<T> = {
  executionId?: string;
  definition?: T;
};

const QueueEntry = <T>(schema: z.ZodSchema<T>) =>
  z.object({
    executionId: z.string(),
    definition: schema,
  });

@Injectable()
export class PipelineJobQueueService {
  private static readonly KEY = 'queue:job:pipeline';

  constructor(private readonly redis: RedisService) {}

  async read(): Promise<QueueEntry<PipelineJob> | null> {
    const entry = await this.redis.dequeue(PipelineJobQueueService.KEY);
    if (entry === null) {
      return null;
    }

    return QueueEntry(PipelineJob).parse(JSON.parse(entry));
  }

  push(executionId: string, definition: any) {
    const entry = QueueEntry(PipelineJob).parse({
      executionId,
      definition,
    });

    return this.redis.push(PipelineJobQueueService.KEY, entry);
  }
}
