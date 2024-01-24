import { MaterialiseQueueService } from '@app/helper/queue/materialise.queue.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MaterialiseJobService } from './materialise/materialise.job.service';
import { ExecutionService } from '@app/helper/execution.service';

@Injectable()
export class MaterialiseWorkerService {
  private readonly logger = new Logger(MaterialiseWorkerService.name);

  constructor(
    private readonly queue: MaterialiseQueueService,
    private readonly executionService: ExecutionService,
    private readonly materialiseJobService: MaterialiseJobService,
  ) {}

  @Cron('*/15 * * * * *')
  async readQueueAndExecute() {
    const job = await this.queue.read();

    if (job === null) {
      return;
    }

    try {
      await this.materialiseJobService.materialise(
        job.executionId,
        job.definition,
      );
    } catch (e) {
      this.logger.error(
        'Job with ID: ' + job.executionId + ' crashed while materialising!',
      );
      await this.executionService.error(job.executionId, e.message ?? '');
    }
  }
}
