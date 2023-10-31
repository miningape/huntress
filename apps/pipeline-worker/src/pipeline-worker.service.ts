import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PipelineWorkerService {
  @Cron('*/30 * * * * *')
  async getHello() {
    return 'Hello World!';
  }
}
