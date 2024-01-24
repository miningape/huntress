import { Injectable } from '@nestjs/common';
import { PipelineJob } from '../job/pipeline.job';
import { RedisQueue } from './redis.queue';

@Injectable()
export class PipelineQueueService extends RedisQueue<typeof PipelineJob> {
  protected readonly KEY = 'job:pipeline';
  protected readonly SCHEMA = PipelineJob;
}
