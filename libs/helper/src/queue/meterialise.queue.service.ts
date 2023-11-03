import { Injectable } from '@nestjs/common';
import { RedisQueue } from './redis.queue';
import { MaterialiseJob } from '../job/materialise.job';
import { RedisService } from '../global/redis.service';

@Injectable()
export class MaterialiseQueueService extends RedisQueue<typeof MaterialiseJob> {
  protected readonly KEY = 'job:materialise';

  constructor(redis: RedisService) {
    super(MaterialiseJob, redis);
  }
}
