import { Injectable } from '@nestjs/common';
import { RedisQueue } from './redis.queue';
import { MaterialiseJob } from '../job/materialise.job';

@Injectable()
export class MaterialiseQueueService extends RedisQueue<typeof MaterialiseJob> {
  protected readonly KEY = 'job:materialise';
  protected readonly SCHEMA = MaterialiseJob;
}
