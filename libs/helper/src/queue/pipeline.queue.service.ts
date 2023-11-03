import { Injectable } from '@nestjs/common';
import { RedisService } from '../global/redis.service';
import { PipelineJob } from '../job/pipeline.job';
import { RedisQueue } from './redis.queue';

@Injectable()
export class PipelineQueueService extends RedisQueue<typeof PipelineJob> {
  protected readonly KEY = 'job:pipeline';

  constructor(redis: RedisService) {
    super(PipelineJob, redis);
  }
}
